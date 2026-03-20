<template>
  <article :class="itemClass">
    <n-avatar
      round
      :size="isReply ? 30 : 40"
      :src="comment.user?.avatar"
      class="comment-avatar"
    >
      {{ avatarFallback }}
    </n-avatar>

    <div class="comment-body">
      <div class="comment-head">
        <span :class="authorClass">{{ displayName }}</span>
        <n-tag v-if="comment.isUpOwner" size="small" round type="error" class="comment-tag">
          UP
        </n-tag>
        <n-tag v-if="comment.isTop" size="small" round type="warning" class="comment-tag">
          置顶
        </n-tag>
      </div>

      <div class="comment-content">
        <template v-if="isReply && replyToName">
          <span class="reply-prefix">回复 @{{ replyToName }}：</span>
        </template>
        {{ comment.content || emptyContentText }}
      </div>

      <div class="comment-meta">
        <span>{{ formattedTime }}</span>
        <span v-if="comment.ipLocation">{{ comment.ipLocation }}</span>
      </div>

      <div class="comment-actions">
        <button
          type="button"
          :class="comment.isLiked ? 'action-btn is-active' : 'action-btn'"
          @click="emit('toggle-like', comment)"
        >
          <span class="action-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
              <path d="M7 10v12" />
            </svg>
          </span>
          <span>{{ formatCount(comment.likeCount) }}</span>
        </button>

        <button
          type="button"
          :class="comment.isBad ? 'action-btn is-active is-bad' : 'action-btn'"
          @click="emit('toggle-dislike', comment)"
        >
          <span class="action-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
              <path d="M17 14V2" />
            </svg>
          </span>
          <span>点踩</span>
        </button>

        <button
          type="button"
          class="action-btn"
          @click="emit('request-reply', comment)"
        >
          <span>回复</span>
        </button>
      </div>

      <div v-if="isReplyEditorVisible" class="reply-editor">
        <n-input
          :value="replyDraft"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          maxlength="500"
          show-count
          :placeholder="replyPlaceholder"
          @update:value="handleReplyDraftChange"
        />
        <div class="reply-editor-actions">
          <button type="button" class="editor-cancel" @click="emit('cancel-reply')">取消</button>
          <n-button
            type="primary"
            color="#00aeec"
            size="small"
            :loading="replySubmitting"
            @click="emit('submit-reply', comment)"
          >
            回复
          </n-button>
        </div>
      </div>

      <div v-if="showRepliesToggle" class="reply-toggle">
        <button
          type="button"
          class="reply-toggle-btn"
          @click="emit('toggle-replies', comment)"
        >
          {{ replyToggleText }}
        </button>
      </div>

      <div v-if="repliesExpanded" class="reply-panel">
        <n-spin :show="repliesLoading">
          <div v-if="replyList.length" class="reply-list">
            <Comment
              v-for="reply in replyList"
              :key="reply.id"
              :comment="reply"
              is-reply
              :active-reply-id="activeReplyId"
              :reply-draft="replyDraft"
              :reply-submitting="replySubmitting"
              @toggle-like="forwardToggleLike"
              @toggle-dislike="forwardToggleDislike"
              @request-reply="forwardRequestReply"
              @update-reply-draft="forwardReplyDraftUpdate"
              @submit-reply="forwardSubmitReply"
              @cancel-reply="forwardCancelReply"
            />
          </div>
          <n-empty
            v-else-if="!repliesLoading"
            size="small"
            description="暂无回复"
            class="reply-empty"
          />
        </n-spin>

        <div v-if="replyTotal > replyPageSize" class="reply-pagination">
          <n-pagination
            size="small"
            :page="replyPage"
            :page-size="replyPageSize"
            :item-count="replyTotal"
            @update:page="handleReplyPageChange"
          />
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CommentVO } from '@/types/comment'

defineOptions({
  name: 'Comment'
})

const props = withDefaults(defineProps<{
  comment: CommentVO
  isReply?: boolean
  showRepliesToggle?: boolean
  repliesExpanded?: boolean
  repliesLoading?: boolean
  replyList?: CommentVO[]
  replyPage?: number
  replyPageSize?: number
  replyTotal?: number
  activeReplyId?: number | null
  replyDraft?: string
  replySubmitting?: boolean
}>(), {
  isReply: false,
  showRepliesToggle: false,
  repliesExpanded: false,
  repliesLoading: false,
  replyList: () => [],
  replyPage: 1,
  replyPageSize: 5,
  replyTotal: 0,
  activeReplyId: null,
  replyDraft: '',
  replySubmitting: false
})

const emit = defineEmits<{
  'toggle-replies': [comment: CommentVO]
  'change-reply-page': [comment: CommentVO, page: number]
  'toggle-like': [comment: CommentVO]
  'toggle-dislike': [comment: CommentVO]
  'request-reply': [comment: CommentVO]
  'update-reply-draft': [value: string]
  'submit-reply': [comment: CommentVO]
  'cancel-reply': []
}>()

const emptyContentText = '评论内容为空'
const itemClass = computed(() => props.isReply ? 'comment-item is-reply' : 'comment-item')
const authorClass = computed(() => props.comment.isUpOwner ? 'comment-author is-up-owner' : 'comment-author')
const displayName = computed(() => props.comment.user?.nickname || `用户 ${props.comment.user?.id || ''}`)
const replyToName = computed(() => props.comment.replyToUser?.nickname || '')
const avatarFallback = computed(() => displayName.value.slice(0, 1) || '评')
const formattedTime = computed(() => formatTime(props.comment.createTime))
const replyToggleText = computed(() => props.repliesExpanded ? '收起回复' : `共 ${formatCount(props.comment.replyCount)} 条回复，点击查看`)
const isReplyEditorVisible = computed(() => Number(props.comment.id) === Number(props.activeReplyId || 0))
const replyPlaceholder = computed(() => `回复 @${displayName.value}`)

function handleReplyPageChange(page: number) {
  emit('change-reply-page', props.comment, page)
}

function handleReplyDraftChange(value: string) {
  emit('update-reply-draft', value)
}

function forwardToggleLike(comment: CommentVO) {
  emit('toggle-like', comment)
}

function forwardToggleDislike(comment: CommentVO) {
  emit('toggle-dislike', comment)
}

function forwardRequestReply(comment: CommentVO) {
  emit('request-reply', comment)
}

function forwardReplyDraftUpdate(value: string) {
  emit('update-reply-draft', value)
}

function forwardSubmitReply(comment: CommentVO) {
  emit('submit-reply', comment)
}

function forwardCancelReply() {
  emit('cancel-reply')
}

function formatCount(value?: number) {
  const count = Number(value || 0)
  if (count >= 10000) {
    return `${(count / 10000).toFixed(count >= 100000 ? 0 : 1).replace(/\.0$/, '')}万`
  }
  return `${count}`
}

function formatTime(value?: string) {
  if (!value) return '刚刚'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>

<style scoped>
.comment-item {
  display: flex;
  gap: 12px;
  padding: 18px 0;
  border-bottom: 1px solid #f1f2f3;
}

.comment-item.is-reply {
  padding: 14px 0 0;
  border-bottom: none;
}

.comment-avatar {
  flex-shrink: 0;
  background: #f1f2f3;
  color: #61666d;
}

.comment-body {
  min-width: 0;
  flex: 1;
}

.comment-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.comment-author {
  font-size: 15px;
  color: #61666d;
  font-weight: 500;
}

.comment-author.is-up-owner {
  color: #fb7299;
}

.comment-tag {
  --n-border-radius: 999px !important;
}

.comment-content {
  color: #18191c;
  font-size: 15px;
  line-height: 24px;
  white-space: pre-wrap;
  word-break: break-word;
  text-align: left;
}

.reply-prefix {
  color: #00aeec;
}

.comment-meta {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  color: #9499a0;
  font-size: 13px;
}

.comment-actions {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: #9499a0;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f6f7f8;
  color: #18191c;
}

.action-btn.is-active {
  color: #00aeec;
}

.action-btn.is-bad.is-active {
  color: #00aeec;
}

.action-icon {
  display: inline-flex;
  align-items: center;
}

.reply-editor {
  margin-top: 12px;
  padding: 12px;
  border-radius: 10px;
  background: #f6f7f8;
}

.reply-editor-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.editor-cancel {
  border: none;
  background: transparent;
  color: #61666d;
  cursor: pointer;
}

.reply-toggle {
  margin-top: 8px;
  text-align: left;
}

.reply-toggle-btn {
  padding: 0;
  color: #00aeec;
  border: none;
  background: transparent;
  font-size: 13px;
  cursor: pointer;
}

.reply-panel {
  margin-top: 12px;
  padding: 2px 16px 14px;
  border-radius: 8px;
  background: #f6f7f8;
}

.reply-list {
  display: flex;
  flex-direction: column;
}

.reply-empty {
  padding-top: 12px;
}

.reply-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}
</style>
