import { STOCK_EXCHANGE_OPTIONS, STOCK_GROUP_OPTIONS } from "@/features/stocks/constants"

export type StockExchangeOption = (typeof STOCK_EXCHANGE_OPTIONS)[number]["value"]
export type StockGroupOption = (typeof STOCK_GROUP_OPTIONS)[number]["value"]
