type AppEnv = {
  API_URL: string
}

const env: AppEnv = {
  API_URL: import.meta.env.VITE_API_URL,
}

export { env }
