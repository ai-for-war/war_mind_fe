import { useEffect, useEffectEvent, useRef } from "react"

type UseScrollAreaInfiniteScrollOptions = {
  hasNextPage: boolean
  isEnabled?: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  rootMargin?: string
}

const VIEWPORT_SELECTOR = '[data-slot="scroll-area-viewport"]'

export const useScrollAreaInfiniteScroll = ({
  hasNextPage,
  isEnabled = true,
  isFetchingNextPage,
  onLoadMore,
  rootMargin = "0px 0px 160px 0px",
}: UseScrollAreaInfiniteScrollOptions) => {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const handleLoadMore = useEffectEvent(() => {
    if (!isEnabled || !hasNextPage || isFetchingNextPage) {
      return
    }

    onLoadMore()
  })

  useEffect(() => {
    if (!isEnabled || !hasNextPage) {
      return
    }

    const root = scrollAreaRef.current?.querySelector<HTMLElement>(VIEWPORT_SELECTOR)
    const sentinel = sentinelRef.current

    if (!root || !sentinel) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting)

        if (!visibleEntry) {
          return
        }

        handleLoadMore()
      },
      {
        root,
        rootMargin,
      },
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [hasNextPage, isEnabled, rootMargin])

  return {
    scrollAreaRef,
    sentinelRef,
  }
}
