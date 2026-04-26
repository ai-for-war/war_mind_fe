# Tài liệu tích hợp Frontend cho Stock Research Scheduling API

## 1. Phạm vi

Tài liệu này mô tả contract backend cho tính năng lập lịch chạy stock research.

Phạm vi chỉ gồm:

- endpoint hiện có
- headers bắt buộc
- request schema FE cần truyền
- response schema BE trả về
- enum, nullable field, timezone, pagination, và error semantics

Tài liệu này không hướng dẫn FE cách code.

## 2. Base path

Stock research schedule endpoints dùng base path:

```text
/api/v1/stock-research/schedules
```

Danh sách endpoint:

- `POST /api/v1/stock-research/schedules`
- `GET /api/v1/stock-research/schedules`
- `GET /api/v1/stock-research/schedules/{schedule_id}`
- `PATCH /api/v1/stock-research/schedules/{schedule_id}`
- `POST /api/v1/stock-research/schedules/{schedule_id}/pause`
- `POST /api/v1/stock-research/schedules/{schedule_id}/resume`
- `DELETE /api/v1/stock-research/schedules/{schedule_id}`
- `POST /api/v1/stock-research/schedules/{schedule_id}/run-now`

Internal dispatcher endpoint `POST /api/v1/internal/trigger-stock-research-schedules` là backend-to-backend endpoint, không phải FE contract.

## 3. Headers bắt buộc

Tất cả schedule endpoints cần:

```http
Authorization: Bearer <token>
X-Organization-ID: <organization_id>
```

Với endpoint có request body:

```http
Content-Type: application/json
```

Semantics:

- schedule được scope theo `current_user + organization`
- cùng user nhưng organization khác nhau sẽ thấy danh sách schedule khác nhau
- nếu `schedule_id` không tồn tại, đã bị xoá, hoặc nằm ngoài scope hiện tại, backend trả `404`

## 4. Enum

```ts
type StockResearchScheduleType =
  | "every_15_minutes"
  | "daily"
  | "weekly";

type StockResearchScheduleStatus =
  | "active"
  | "paused"
  | "deleted";

type StockResearchScheduleWeekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

type StockResearchReportStatus =
  | "queued"
  | "running"
  | "completed"
  | "partial"
  | "failed";
```

## 5. Timezone và datetime semantics

- `daily` và `weekly` dùng `hour` theo timezone `Asia/Saigon`.
- `hour` là integer từ `0` đến `23`.
- Backend trả `next_run_at`, `created_at`, `updated_at`, `started_at`, `completed_at` dưới dạng ISO datetime string.
- `next_run_at` là thời điểm UTC backend sẽ dùng để dispatch lần kế tiếp.
- Với `daily` và `weekly`, FE hiển thị local time nên hiểu `hour` là giờ Việt Nam, còn `next_run_at` là timestamp tuyệt đối do BE tính.

## 6. Request schema dùng chung

### 6.1 Runtime config

Schedule dùng cùng runtime catalog với stock research report.

```ts
type StockResearchReportRuntimeConfigRequest = {
  provider: string;
  model: string;
  reasoning?: string | null;
}
```

Validation:

- `provider`: required, string không rỗng, max length `100`
- `model`: required, string không rỗng, max length `200`
- `reasoning`: optional, có thể `null`, max length `50` khi có giá trị

FE nên lấy giá trị hợp lệ từ:

```text
GET /api/v1/stock-research/reports/catalog
```

### 6.2 Schedule definition

Field public trong JSON là `type`.

```ts
type Every15MinutesScheduleDefinition = {
  type: "every_15_minutes";
}

type DailyScheduleDefinition = {
  type: "daily";
  hour: number;
}

type WeeklyScheduleDefinition = {
  type: "weekly";
  hour: number;
  weekdays: StockResearchScheduleWeekday[];
}

type StockResearchScheduleDefinitionRequest =
  | Every15MinutesScheduleDefinition
  | DailyScheduleDefinition
  | WeeklyScheduleDefinition;
```

Validation theo từng `type`:

- `every_15_minutes`: không được gửi `hour`, không được gửi `weekdays`
- `daily`: bắt buộc gửi `hour`, không được gửi `weekdays`
- `weekly`: bắt buộc gửi `hour`, bắt buộc gửi ít nhất một `weekday`
- `weekdays` được normalize lowercase và deduplicate theo thứ tự FE gửi

## 7. Create schedule

Endpoint:

```text
POST /api/v1/stock-research/schedules
```

Status code thành công:

```text
201 Created
```

Request schema:

```ts
type StockResearchScheduleCreateRequest = {
  symbol: string;
  runtime_config: StockResearchReportRuntimeConfigRequest;
  schedule: StockResearchScheduleDefinitionRequest;
}
```

Validation:

- `symbol`: required, string không rỗng, max length `32`
- backend normalize `symbol` về uppercase
- `runtime_config`: required
- `schedule`: required

Request body ví dụ `every_15_minutes`:

```json
{
  "symbol": "FPT",
  "runtime_config": {
    "provider": "openai",
    "model": "gpt-5.2",
    "reasoning": "high"
  },
  "schedule": {
    "type": "every_15_minutes"
  }
}
```

Request body ví dụ `daily`:

```json
{
  "symbol": "FPT",
  "runtime_config": {
    "provider": "openai",
    "model": "gpt-5.2",
    "reasoning": "high"
  },
  "schedule": {
    "type": "daily",
    "hour": 8
  }
}
```

Request body ví dụ `weekly`:

```json
{
  "symbol": "FPT",
  "runtime_config": {
    "provider": "openai",
    "model": "gpt-5.2",
    "reasoning": "high"
  },
  "schedule": {
    "type": "weekly",
    "hour": 8,
    "weekdays": ["monday", "wednesday", "friday"]
  }
}
```

Response schema:

```ts
type StockResearchScheduleResponse = {
  id: string;
  symbol: string;
  status: StockResearchScheduleStatus;
  schedule: StockResearchScheduleDefinitionResponse;
  next_run_at: string;
  created_at: string;
  updated_at: string;
  runtime_config: StockResearchReportRuntimeConfigResponse;
}
```

Response body ví dụ:

```json
{
  "id": "680b5d1d6f3c6d1245a00001",
  "symbol": "FPT",
  "status": "active",
  "schedule": {
    "type": "daily",
    "hour": 8,
    "weekdays": []
  },
  "next_run_at": "2026-04-24T01:00:00Z",
  "created_at": "2026-04-23T10:15:00Z",
  "updated_at": "2026-04-23T10:15:00Z",
  "runtime_config": {
    "provider": "openai",
    "model": "gpt-5.2",
    "reasoning": "high"
  }
}
```

## 8. List schedules

Endpoint:

```text
GET /api/v1/stock-research/schedules
```

Query params:

```ts
type StockResearchScheduleListQuery = {
  page?: number;
  page_size?: number;
}
```

Validation:

- `page`: default `1`, min `1`
- `page_size`: default `20`, min `1`, max `100`

Status code thành công:

```text
200 OK
```

Response schema:

```ts
type StockResearchScheduleListResponse = {
  items: StockResearchScheduleSummary[];
  total: number;
  page: number;
  page_size: number;
}
```

Trong đó `StockResearchScheduleSummary` có cùng field với `StockResearchScheduleResponse`.

Response body ví dụ:

```json
{
  "items": [
    {
      "id": "680b5d1d6f3c6d1245a00001",
      "symbol": "FPT",
      "status": "active",
      "schedule": {
        "type": "daily",
        "hour": 8,
        "weekdays": []
      },
      "next_run_at": "2026-04-24T01:00:00Z",
      "created_at": "2026-04-23T10:15:00Z",
      "updated_at": "2026-04-23T10:15:00Z",
      "runtime_config": {
        "provider": "openai",
        "model": "gpt-5.2",
        "reasoning": "high"
      }
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

Ordering hiện tại:

- schedules được trả newest-first theo `created_at desc`
- schedule đã xoá mềm không xuất hiện trong list

## 9. Get schedule detail

Endpoint:

```text
GET /api/v1/stock-research/schedules/{schedule_id}
```

Không có request body.

Status code thành công:

```text
200 OK
```

Response schema:

```ts
type GetStockResearchScheduleResponse = StockResearchScheduleResponse;
```

## 10. Update schedule

Endpoint:

```text
PATCH /api/v1/stock-research/schedules/{schedule_id}
```

Status code thành công:

```text
200 OK
```

Request schema:

```ts
type StockResearchScheduleUpdateRequest = {
  symbol?: string | null;
  runtime_config?: StockResearchReportRuntimeConfigRequest | null;
  schedule?: StockResearchScheduleDefinitionRequest | null;
  status?: StockResearchScheduleStatus | null;
}
```

Semantics:

- mọi field trong update body đều optional
- nếu gửi `symbol`, backend normalize uppercase và validate symbol tồn tại trong stock catalog
- nếu gửi `runtime_config`, backend validate provider/model/reasoning như create schedule
- nếu gửi `schedule`, phải gửi một schedule definition hợp lệ theo `type`
- nếu gửi `status: "active"`, backend tính lại `next_run_at` từ thời điểm hiện tại
- nếu gửi `schedule`, backend cũng tính lại `next_run_at`

Request body ví dụ đổi lịch:

```json
{
  "schedule": {
    "type": "weekly",
    "hour": 9,
    "weekdays": ["tuesday", "thursday"]
  }
}
```

Request body ví dụ đổi runtime:

```json
{
  "runtime_config": {
    "provider": "openai",
    "model": "gpt-5.2",
    "reasoning": "medium"
  }
}
```

Response schema:

```ts
type UpdateStockResearchScheduleResponse = StockResearchScheduleResponse;
```

## 11. Pause schedule

Endpoint:

```text
POST /api/v1/stock-research/schedules/{schedule_id}/pause
```

Không có request body.

Status code thành công:

```text
200 OK
```

Response schema:

```ts
type PauseStockResearchScheduleResponse = StockResearchScheduleResponse;
```

Response có `status: "paused"`.

## 12. Resume schedule

Endpoint:

```text
POST /api/v1/stock-research/schedules/{schedule_id}/resume
```

Không có request body.

Status code thành công:

```text
200 OK
```

Response schema:

```ts
type ResumeStockResearchScheduleResponse = StockResearchScheduleResponse;
```

Response có `status: "active"` và `next_run_at` được tính lại từ thời điểm resume.

## 13. Delete schedule

Endpoint:

```text
DELETE /api/v1/stock-research/schedules/{schedule_id}
```

Không có request body.

Status code thành công:

```text
200 OK
```

Response schema:

```ts
type StockResearchScheduleDeleteResponse = {
  id: string;
  deleted: true;
}
```

Response body ví dụ:

```json
{
  "id": "680b5d1d6f3c6d1245a00001",
  "deleted": true
}
```

Semantics:

- backend xoá mềm bằng trạng thái `deleted`
- schedule đã xoá không được trả trong list/get thông thường

## 14. Run schedule now

Endpoint:

```text
POST /api/v1/stock-research/schedules/{schedule_id}/run-now
```

Không có request body.

Status code thành công:

```text
202 Accepted
```

Semantics:

- endpoint tạo ngay một stock research report từ cấu hình hiện tại của schedule
- endpoint không thay đổi cadence của schedule và không move `next_run_at`
- report được enqueue xử lý async giống manual report

Response schema:

```ts
type StockResearchReportCreateResponse = {
  id: string;
  symbol: string;
  status: StockResearchReportStatus;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
  runtime_config: StockResearchReportRuntimeConfigResponse | null;
}
```

Response body ví dụ:

```json
{
  "id": "680b5d1d6f3c6d1245a00002",
  "symbol": "FPT",
  "status": "queued",
  "created_at": "2026-04-23T10:20:00Z",
  "started_at": null,
  "completed_at": null,
  "updated_at": "2026-04-23T10:20:00Z",
  "runtime_config": {
    "provider": "openai",
    "model": "gpt-5.2",
    "reasoning": "high"
  }
}
```

## 15. Response schema dùng chung

### 15.1 Runtime config response

```ts
type StockResearchReportRuntimeConfigResponse = {
  provider: string;
  model: string;
  reasoning: string | null;
}
```

### 15.2 Schedule definition response

Backend luôn trả `weekdays` là array. Với `every_15_minutes` và `daily`, array này là `[]`.

```ts
type StockResearchScheduleDefinitionResponse = {
  type: StockResearchScheduleType;
  hour: number | null;
  weekdays: StockResearchScheduleWeekday[];
}
```

### 15.3 Schedule summary/response

```ts
type StockResearchScheduleSummary = {
  id: string;
  symbol: string;
  status: StockResearchScheduleStatus;
  schedule: StockResearchScheduleDefinitionResponse;
  next_run_at: string;
  created_at: string;
  updated_at: string;
  runtime_config: StockResearchReportRuntimeConfigResponse;
}

type StockResearchScheduleResponse = StockResearchScheduleSummary;
```

## 16. Liên hệ với Stock Research Report API

Scheduled run và run-now đều tạo stock research report.

Các endpoint report hiện có:

- `GET /api/v1/stock-research/reports/{report_id}`
- `GET /api/v1/stock-research/reports`

Lưu ý contract hiện tại:

- `run-now` trả `StockResearchReportCreateResponse`
- report REST response hiện chưa expose `trigger_type`, `schedule_id`, hoặc `schedule_run_id`
- nếu FE cần biết report nào được sinh từ schedule nào trong list/get report, backend cần bổ sung field đó vào response schema trước

## 17. Error response shape

Khi request lỗi do `AppException` hoặc auth/org dependency, response thường có shape:

```json
{
  "detail": "Error message"
}
```

Schema:

```ts
type ErrorResponse = {
  detail: string;
}
```

Nhóm lỗi FE có thể gặp:

- `400 Bad Request`: thiếu `X-Organization-ID`, request body/query không hợp lệ
- `401 Unauthorized`: token không hợp lệ hoặc account không active
- `403 Forbidden`: user không thuộc organization được gửi lên
- `404 Not Found`: organization không tồn tại, stock symbol không tồn tại, hoặc schedule không tồn tại/không thuộc scope
- `422 Unprocessable Entity`: FastAPI/Pydantic validation error cho body/query/path
- `502 Bad Gateway`: backend không enqueue được report khi `run-now`

Detail message hiện tại có thể gồm:

- `X-Organization-ID header is required`
- `Permission denied`
- `Organization not found`
- `Stock symbol not found`
- `Stock research schedule not found`
- `Stock research schedule dispatch failed`

FE không nên hardcode business logic dựa trên text message; status code là contract ổn định hơn.

## 18. Tóm tắt contract

Request chính:

- create schedule: `symbol`, `runtime_config`, `schedule`
- update schedule: optional `symbol`, optional `runtime_config`, optional `schedule`, optional `status`
- list schedules: optional `page`, optional `page_size`
- pause/resume/delete/run-now: không có request body

Response chính:

- schedule detail: `id`, `symbol`, `status`, `schedule`, `next_run_at`, `created_at`, `updated_at`, `runtime_config`
- schedule list: `items`, `total`, `page`, `page_size`
- delete: `id`, `deleted`
- run-now: report create summary với `id`, `symbol`, `status`, timestamps, `runtime_config`

Timezone:

- `daily` và `weekly` dùng `hour` theo `Asia/Saigon`
- `next_run_at` là ISO datetime tuyệt đối do backend tính và trả về
