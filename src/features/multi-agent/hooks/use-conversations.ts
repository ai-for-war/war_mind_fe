import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query"

import { conversationsApi } from "@/features/multi-agent/api/conversations-api"
import { multiAgentQueryKeys } from "@/features/multi-agent/query-keys"
import type {
  ConversationListItem,
  ConversationListParams,
  ConversationListResponse,
} from "@/features/multi-agent/types/conversation.types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

const DEFAULT_SKIP = 0
const DEFAULT_LIMIT = 20

const normalizeParams = (params: ConversationListParams): Required<ConversationListParams> => ({
  limit: params.limit ?? DEFAULT_LIMIT,
  search: params.search ?? "",
  skip: params.skip ?? DEFAULT_SKIP,
  status: params.status ?? "active",
})

type ConversationListQueryResult = UseInfiniteQueryResult<
  InfiniteData<ConversationListResponse>,
  Error
>

type UseConversationsQueryResult = ConversationListQueryResult & {
  conversations: ConversationListItem[]
  hasNextPage: boolean
  isEmpty: boolean
  isFetchingNextPage: boolean
}

export const useConversations = (
  params: ConversationListParams = {},
): UseConversationsQueryResult => {
  const activeOrganizationId = useActiveOrganizationId()
  const normalizedParams = normalizeParams(params)
  const { skip: initialSkip, ...baseParams } = normalizedParams

  const query = useInfiniteQuery<
    ConversationListResponse,
    Error,
    InfiniteData<ConversationListResponse>,
    ReturnType<typeof multiAgentQueryKeys.conversationsList>,
    number
  >({
    getNextPageParam: (lastPage) => {
      const nextSkip = lastPage.skip + lastPage.items.length
      return nextSkip < lastPage.total ? nextSkip : undefined
    },
    initialPageParam: initialSkip,
    queryFn: ({ pageParam }) =>
      conversationsApi.listConversations({
        ...baseParams,
        skip: pageParam,
      }),
    queryKey: multiAgentQueryKeys.conversationsList(
      activeOrganizationId,
      normalizedParams,
    ),
  })

  const seenConversationIds = new Set<string>()
  const conversations =
    query.data?.pages.flatMap((page) =>
      page.items.filter((conversation) => {
        if (seenConversationIds.has(conversation.id)) {
          return false
        }

        seenConversationIds.add(conversation.id)
        return true
      }),
    ) ?? []
  const isEmpty = !query.isPending && !query.isError && conversations.length === 0

  return {
    ...query,
    conversations,
    hasNextPage: query.hasNextPage ?? false,
    isEmpty,
    isFetchingNextPage: query.isFetchingNextPage,
  }
}
