<template>
  <section class="comment-tree">
    <div class="comment-header">
      <div class="comment-title">
        评论
        <span class="comment-count">{{ formatCount(commentCount) }}</span>
      </div>

      <div class="comment-sort">
        <button
          v-for="item in sortOptions"
          :key="item.value"
          type="button"
          :class="sortType === item.value ? 'sort-btn active' : 'sort-btn'"
          @click="changeSort(item.value)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <div class="comment-editor">
      <n-avatar round :size="42" :src="userStore.user?.avatar" class="editor-avatar">
        {{ userAvatarText }}
      </n-avatar>
      <div class="editor-main">
        <n-input
          v-model:value="draftContent"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 5 }"
          maxlength="500"
          show-count
          placeholder="发一条友善的评论见证当下"
        />
        <div class="editor-actions">
          <span class="editor-tip">{{ editorTip }}</span>
          <n-button
            type="primary"
            color="#00aeec"
            :loading="submitting"
            @click="submitComment"
          >
            发布
          </n-button>
        </div>
      </div>
    </div>

    <n-spin :show="initialLoading">
      <div v-if="rootComments.length" class="comment-list">
        <Comment
          v-for="comment in rootComments"
          :key="comment.id"
          :comment="comment"
          :show-replies-toggle="Number(comment.replyCount || 0) > 0"
          :replies-expanded="getReplyState(comment.id).expanded"
          :replies-loading="getReplyState(comment.id).loading"
          :reply-list="getReplyState(comment.id).list"
          :reply-page="getReplyState(comment.id).page"
          :reply-page-size="replyPageSize"
          :reply-total="getReplyTotal(comment)"
          :active-reply-id="activeReplyId"
          :reply-draft="replyDraft"
          :reply-submitting="replySubmitting"
          @toggle-replies="toggleReplies"
          @change-reply-page="changeReplyPage"
          @toggle-like="toggleLike"
          @toggle-dislike="toggleDislike"
          @request-reply="openReplyEditor"
          @update-reply-draft="updateReplyDraft"
          @submit-reply="submitReply"
          @cancel-reply="closeReplyEditor"
        />
      </div>

      <n-empty
        v-else-if="!initialLoading"
        description="还没有评论，来抢个沙发吧"
        class="comment-empty"
      />
    </n-spin>

    <div v-if="rootComments.length && hasMore" class="load-more">
      <n-button
        quaternary
        color="#00aeec"
        :loading="loadingMore"
        @click="loadMoreRootComments"
      >
        加载更多评论
      </n-button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  apiCancelDislikeComment,
  apiCancelLikeComment,
  apiCreateComment,
  apiDislikeComment,
  apiGetCommentCount,
  apiGetReplies,
  apiGetRootComments,
  apiLikeComment
} from '@/api/comment'
import Comment from '@/components/features/comment/Comment.vue'
import { useUserStore } from '@/store'
import type { CommentVO } from '@/types/comment'

interface ReplyState {
  expanded: boolean
  loading: boolean
  loaded: boolean
  page: number
  total: number
  list: CommentVO[]
}

const props = defineProps<{
  vid: number
}>()

const message = useMessage()
const userStore = useUserStore()

const rootComments = ref<CommentVO[]>([])
const commentCount = ref(0)
const initialLoading = ref(false)
const loadingMore = ref(false)
const submitting = ref(false)
const replySubmitting = ref(false)
const hasMore = ref(false)
const nextCursor = ref<string | number | undefined>(undefined)
const sortType = ref('hot')
const draftContent = ref('')
const replyDraft = ref('')
const activeReplyId = ref<number | null>(null)
const replyPageSize = 5

const replyStates = reactive<Record<number, ReplyState>>({})

const sortOptions = [
  { label: '按热度排序', value: 'hot' },
  { label: '按时间排序', value: 'time' }
]

const userAvatarText = computed(() => userStore.user?.nickname?.slice(0, 1) || '评')
const editorTip = computed(() => userStore.isLogin ? '理性发言，友善交流' : '登录后可参与评论')

watch(
  () => props.vid,
  (vid) => {
    if (!vid) {
      rootComments.value = []
      commentCount.value = 0
      clearReplies()
      closeReplyEditor()
      return
    }
    void resetAndLoad()
  },
  { immediate: true }
)

async function resetAndLoad() {
  clearReplies()
  closeReplyEditor()
  nextCursor.value = undefined
  hasMore.value = false
  rootComments.value = []
  initialLoading.value = true

  try {
    const [count, rootRes] = await Promise.all([
      apiGetCommentCount(props.vid),
      apiGetRootComments({
        vid: props.vid,
        sortType: sortType.value,
        cursor: ''
      })
    ])

    commentCount.value = Number(count || 0)
    rootComments.value = normalizeRootList(rootRes.list)
    nextCursor.value = rootRes.nextCursor
    hasMore.value = Boolean(rootRes.hasMore)
  } catch (error) {
    console.error('load comments failed', error)
    message.error('评论加载失败，请稍后重试')
  } finally {
    initialLoading.value = false
  }
}

async function loadMoreRootComments() {
  if (!props.vid || !hasMore.value || loadingMore.value) return

  loadingMore.value = true
  try {
    const res = await apiGetRootComments({
      vid: props.vid,
      sortType: sortType.value,
      cursor: nextCursor.value ?? ''
    })

    rootComments.value.push(...normalizeRootList(res.list))
    nextCursor.value = res.nextCursor
    hasMore.value = Boolean(res.hasMore)
  } catch (error) {
    console.error('load more comments failed', error)
    message.error('加载更多评论失败')
  } finally {
    loadingMore.value = false
  }
}

async function toggleReplies(comment: CommentVO) {
  const rootId = Number(comment.id)
  if (!rootId) return

  const state = ensureReplyState(rootId, Number(comment.replyCount || 0))
  state.expanded = !state.expanded

  if (state.expanded && !state.loaded) {
    await loadReplies(comment, 1)
  }
}

async function changeReplyPage(comment: CommentVO, page: number) {
  await loadReplies(comment, page)
}

async function loadReplies(comment: CommentVO, page: number) {
  const rootId = Number(comment.id)
  if (!rootId) return

  const state = ensureReplyState(rootId, Number(comment.replyCount || 0))
  state.loading = true

  try {
    const res = await apiGetReplies(rootId, page, replyPageSize)
    state.list = Array.isArray(res.list) ? res.list : []
    state.page = page
    state.total = Number(res.total || comment.replyCount || 0)
    state.loaded = true
    state.expanded = true
  } catch (error) {
    console.error('load replies failed', error)
    message.error('回复加载失败')
  } finally {
    state.loading = false
  }
}

async function submitComment() {
  const content = draftContent.value.trim()
  if (!content) {
    message.warning('先写点内容再发布吧')
    return
  }
  if (!assertLogin()) return

  submitting.value = true
  try {
    await apiCreateComment({
      vid: props.vid,
      content
    })
    draftContent.value = ''
    message.success('评论发布成功')
    await resetAndLoad()
  } catch (error) {
    console.error('create comment failed', error)
    message.error('评论发布失败')
  } finally {
    submitting.value = false
  }
}

async function toggleLike(comment: CommentVO) {
  if (!assertLogin()) return
  const id = Number(comment.id)
  if (!id) return

  try {
    if (comment.isLiked) {
      await apiCancelLikeComment(id)
      comment.isLiked = false
      comment.likeCount = Math.max(0, Number(comment.likeCount || 0) - 1)
      return
    }

    await apiLikeComment(id)
    comment.isLiked = true
    comment.isBad = false
    comment.likeCount = Number(comment.likeCount || 0) + 1
  } catch (error) {
    console.error('toggle like failed', error)
    message.error('点赞操作失败')
  }
}

async function toggleDislike(comment: CommentVO) {
  if (!assertLogin()) return
  const id = Number(comment.id)
  if (!id) return

  try {
    if (comment.isBad) {
      await apiCancelDislikeComment(id)
      comment.isBad = false
      return
    }

    await apiDislikeComment(id)
    if (comment.isLiked) {
      comment.likeCount = Math.max(0, Number(comment.likeCount || 0) - 1)
    }
    comment.isLiked = false
    comment.isBad = true
  } catch (error) {
    console.error('toggle dislike failed', error)
    message.error('点踩操作失败')
  }
}

function openReplyEditor(comment: CommentVO) {
  if (!assertLogin()) return

  activeReplyId.value = Number(comment.id || 0)
  replyDraft.value = ''

  const rootId = Number(comment.rootId || comment.id || 0)
  if (rootId && rootId !== Number(comment.id || 0)) {
    const rootComment = rootComments.value.find(item => Number(item.id) === rootId)
    if (rootComment) {
      const state = ensureReplyState(rootId, Number(rootComment.replyCount || 0))
      state.expanded = true
      if (!state.loaded) {
        void loadReplies(rootComment, 1)
      }
    }
  }
}

function updateReplyDraft(value: string) {
  replyDraft.value = value
}

function closeReplyEditor() {
  activeReplyId.value = null
  replyDraft.value = ''
}

async function submitReply(target: CommentVO) {
  const content = replyDraft.value.trim()
  if (!content) {
    message.warning('先写点内容再回复吧')
    return
  }
  if (!assertLogin()) return

  const targetId = Number(target.id)
  const rootId = Number(target.rootId || target.id)
  if (!targetId || !rootId) return

  replySubmitting.value = true
  try {
    await apiCreateComment({
      vid: props.vid,
      rootId,
      parentId: targetId,
      toUid: target.user?.id,
      content
    })

    const rootComment = rootComments.value.find(item => Number(item.id) === rootId)
    if (rootComment) {
      rootComment.replyCount = Number(rootComment.replyCount || 0) + 1
      await loadReplies(rootComment, 1)
    } else {
      await resetAndLoad()
    }

    closeReplyEditor()
    message.success('回复发送成功')
  } catch (error) {
    console.error('submit reply failed', error)
    message.error('回复发送失败')
  } finally {
    replySubmitting.value = false
  }
}

function changeSort(nextSort: string) {
  if (sortType.value === nextSort) return
  sortType.value = nextSort
  void resetAndLoad()
}

function getReplyState(id?: number) {
  if (!id) {
    return {
      expanded: false,
      loading: false,
      loaded: false,
      page: 1,
      total: 0,
      list: []
    }
  }
  return ensureReplyState(id, 0)
}

function getReplyTotal(comment: CommentVO) {
  const state = getReplyState(comment.id)
  return state.total || Number(comment.replyCount || 0)
}

function ensureReplyState(rootId: number, total: number) {
  if (!replyStates[rootId]) {
    replyStates[rootId] = {
      expanded: false,
      loading: false,
      loaded: false,
      page: 1,
      total,
      list: []
    }
  }

  return replyStates[rootId]
}

function clearReplies() {
  for (const key of Object.keys(replyStates)) {
    delete replyStates[Number(key)]
  }
}

function normalizeRootList(list: unknown) {
  return Array.isArray(list) ? (list as CommentVO[]) : []
}

function assertLogin() {
  if (userStore.isLogin) return true
  message.warning('请先登录后再操作')
  return false
}

function formatCount(value?: number) {
  const count = Number(value || 0)
  if (count >= 10000) {
    return `${(count / 10000).toFixed(count >= 100000 ? 0 : 1).replace(/\.0$/, '')}万`
  }
  return `${count}`
}
</script>

<style scoped>
.comment-tree {
  border-top: 1px solid #f1f2f3;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.comment-title {
  font-size: 22px;
  font-weight: 600;
  color: #18191c;
}

.comment-count {
  margin-left: 8px;
  font-size: 16px;
  color: #61666d;
}

.comment-sort {
  display: flex;
  gap: 16px;
}

.sort-btn {
  padding: 0;
  border: none;
  background: transparent;
  color: #9499a0;
  font-size: 14px;
  cursor: pointer;
}

.sort-btn.active {
  color: #18191c;
  font-weight: 600;
}

.comment-editor {
  display: flex;
  gap: 14px;
  margin-bottom: 14px;
}

.editor-avatar {
  flex-shrink: 0;
  background: #f1f2f3;
  color: #61666d;
}

.editor-main {
  flex: 1;
  text-align: left;
}

.editor-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.editor-tip {
  font-size: 13px;
  color: #9499a0;
}

.comment-list {
  display: flex;
  flex-direction: column;
}

.comment-empty {
  padding: 32px 0 40px;
}

.load-more {
  display: flex;
  justify-content: center;
  padding: 20px 0 8px;
}

@media (max-width: 960px) {
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .comment-editor {
    align-items: flex-start;
  }
}
</style>
