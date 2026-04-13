export const DEFAULT_STOCK_PAGE_SIZE = 20

export const STOCK_EXCHANGE_OPTIONS = [
  { label: "HOSE", value: "HOSE" },
  { label: "HNX", value: "HNX" },
  { label: "UPCOM", value: "UPCOM" },
] as const

export const STOCK_GROUP_OPTIONS = [
  { label: "VN30", value: "VN30" },
  { label: "VN100", value: "VN100" },
  { label: "VNAllShare", value: "VNAllShare" },
  { label: "VNMidCap", value: "VNMidCap" },
  { label: "VNSmallCap", value: "VNSmallCap" },
  { label: "HNX30", value: "HNX30" },
  { label: "ETF", value: "ETF" },
  { label: "CW", value: "CW" },
] as const

export const STOCK_INDUSTRY_OPTIONS = [
  { industryCode: 500, industryName: "Dầu khí" },
  { industryCode: 1300, industryName: "Hóa chất" },
  { industryCode: 1700, industryName: "Tài nguyên Cơ bản" },
  { industryCode: 2300, industryName: "Xây dựng và Vật liệu" },
  { industryCode: 2700, industryName: "Hàng & Dịch vụ Công nghiệp" },
  { industryCode: 3300, industryName: "Ô tô và phụ tùng" },
  { industryCode: 3500, industryName: "Thực phẩm và đồ uống" },
  { industryCode: 3700, industryName: "Hàng cá nhân & Gia dụng" },
  { industryCode: 4500, industryName: "Y tế" },
  { industryCode: 5300, industryName: "Bán lẻ" },
  { industryCode: 5500, industryName: "Truyền thông" },
  { industryCode: 5700, industryName: "Du lịch và Giải trí" },
  { industryCode: 6500, industryName: "Viễn thông" },
  { industryCode: 7500, industryName: "Điện, nước & xăng dầu khí đốt" },
  { industryCode: 8300, industryName: "Ngân hàng" },
  { industryCode: 8500, industryName: "Bảo hiểm" },
  { industryCode: 8600, industryName: "Bất động sản" },
  { industryCode: 8700, industryName: "Dịch vụ tài chính" },
  { industryCode: 9500, industryName: "Công nghệ Thông tin" },
] as const
