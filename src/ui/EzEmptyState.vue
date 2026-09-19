<script setup lang="ts">
/**
 * 빈 상태.
 *
 * "조회 결과 없음"과 "아직 등록한 것이 없음"은 다른 화면이다 — 전자는 조건을 바꾸라고,
 * 후자는 만들라고 안내해야 한다. `variant`로 가른다.
 */
withDefaults(
  defineProps<{
    variant?: 'no-result' | 'empty' | 'error'
    title?: string
    description?: string
  }>(),
  { variant: 'no-result' },
)

const DEFAULT_TITLE = {
  'no-result': '조회 결과가 없습니다.',
  empty: '등록된 항목이 없습니다.',
  error: '불러오지 못했습니다.',
} as const
</script>

<template>
  <div class="ez-empty" :class="{ 'ez-empty--error': variant === 'error' }" role="status">
    <p class="ez-empty__title">{{ title ?? DEFAULT_TITLE[variant] }}</p>
    <p v-if="description" class="ez-empty__desc">{{ description }}</p>
    <div v-if="$slots.action" class="ez-empty__action"><slot name="action" /></div>
  </div>
</template>

<style scoped>
.ez-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ez-space-2);
  padding: var(--ez-space-12) var(--ez-space-4);
  text-align: center;
}

.ez-empty__title {
  font-size: var(--ez-font-size-sm);
  color: var(--ez-text-muted);
}

.ez-empty--error .ez-empty__title { color: var(--ez-text-danger); }

.ez-empty__desc {
  font-size: var(--ez-font-size-xs);
  color: var(--ez-text-muted);
}

.ez-empty__action { margin-top: var(--ez-space-2); }
</style>
