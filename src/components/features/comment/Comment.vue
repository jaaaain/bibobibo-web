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
        <span :class="authorClass">
          {{ displayName }}
        </span>
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
        <span class="action-text">点赞 {{ formatCount(comment.likeCount) }}</span>
        <span class="action-text">回复</span>
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
}>(), {
  isReply: false,
  showRepliesToggle: false,
  repliesExpanded: false,
  repliesLoading: false,
  replyList: () => [],
  replyPage: 1,
  replyPageSize: 5,
  replyTotal: 0
})

const emit = defineEmits<{
  'toggle-replies': [comment: CommentVO]
  'change-reply-page': [comment: CommentVO, page: number]
}>()

const emptyContentText = 'No comment yet'
const itemClass = computed(() => props.isReply ? 'comment-item is-reply' : 'comment-item')
const authorClass = computed(() => props.comment.isUpOwner ? 'comment-author is-up-owner' : 'comment-author')
const displayName = computed(() => props.comment.user?.nickname || `User ${props.comment.user?.id || ''}`)
const replyToName = computed(() => props.comment.replyToUser?.nickname || '')
const avatarFallback = computed(() => displayName.value.slice(0, 1) || 'C')
const formattedTime = computed(() => formatTime(props.comment.createTime))
const replyToggleText = computed(() => {
  if (props.repliesExpanded) return '收起回复'
  return `共 ${formatCount(props.comment.replyCount)} 条回复，点击查看`
})

function handleReplyPageChange(page: number) {
  emit('change-reply-page', props.comment, page)
}

function formatCount(value?: number) {
  const count = Number(value || 0)
  if (count >= 10000) {
    return `${(count / 10000).toFixed(count >= 100000 ? 0 : 1).replace(/\.0$/, '')}w`
  }
  return `${count}`
}

function formatTime(value?: string) {
  if (!value) return 'just now'
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
  gap: 18px;
  margin-top: 8px;
  color: #9499a0;
  font-size: 13px;
}

.action-text {
  cursor: default;
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
