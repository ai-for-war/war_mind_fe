export interface ValidationError {
  loc: string[]
  msg: string
  type: string
}

export interface ApiErrorResponse {
  detail: string | ValidationError[]
}
