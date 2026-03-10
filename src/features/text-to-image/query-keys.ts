export const textToImageQueryKeys = {
  all: ["text-to-image"] as const,
  history: () => [...textToImageQueryKeys.all, "history"] as const,
  detail: (jobId: string) =>
    [...textToImageQueryKeys.all, "detail", jobId] as const,
  lifecycle: () => [...textToImageQueryKeys.all, "lifecycle"] as const,
}
