<script setup lang="ts">
/**
 * 페이지네이션.
 *
 * `mode`가 둘인 이유는 h-pms에 두 형태가 실제로 병존했기 때문이다 —
 * `이전 3/12 다음`(조밀한 목록)과 `« 1 2 3 »`(대시보드). 하나로 통일하면 어느 쪽이든
 * 표시가 바뀌므로 두 벌을 유지하되 마크업은 한 컴포넌트가 갖는다.
 *
 * `<nav aria-label>`로 감싸고 현재 페이지에 `aria-current="page"`를 준다 —
 * 이게 없으면 스크린리더가 번호 나열을 그냥 링크 묶음으로 읽는다.
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    page: number
    totalPages: number
    mode?: 'compact' | 'numbers'
    /** numbers 모드에서 한 번에 보여줄 번호 개수 */
    window?: number
  }>(),
  { mode: 'compact', window: 10 },
)

const emit = defineEmits<{ 'update:page': [value: number] }>()

/** 현재 페이지가 낀 10개 묶음. h-pms Prev2/Next2(10페이지 단위)와 같은 규칙 */
const numbers = computed(() => {
  const block = Math.floor((props.page - 1) / props.window)
  const start = block * props.window + 1
  const end = Math.min(start + props.window - 1, props.totalPages)
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i)
})

function go(next: number) {
  const clamped = Math.min(Math.max(1, next), props.totalPages)
  if (clamped !== props.page) emit('update:page', clamped)
}
</script>

<template>
  <nav class="ez-pager" aria-label="페이지 이동">
    <button class="ez-pager__btn" :disabled="page <= 1" @click="go(page - 1)">이전</button>

    <template v-if="mode === 'numbers'">
      <button
        v-for="n in numbers"
        :key="n"
        class="ez-pager__num"
        :class="{ 'ez-pager__num--on': n === page }"
        :aria-current="n === page ? 'page' : undefined"
        @click="go(n)"
      >
        {{ n }}
      </button>
    </template>
    <span v-else class="ez-pager__info" aria-live="polite">{{ page }} / {{ totalPages }}</span>

    <button class="ez-pager__btn" :disabled="page >= totalPages" @click="go(page + 1)">다음</button>
  </nav>
</template>

<style scoped>
.ez-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ez-space-1);
  padding: var(--ez-space-3) 0;
}

.ez-pager__btn,
.ez-pager__num {
  min-width: var(--ez-size-sm);
  height: var(--ez-size-sm);
  padding: 0 var(--ez-space-2);
  border: 1px solid var(--ez-border-default);
  border-radius: var(--ez-radius-sm);
  background: var(--ez-surface-default);
  color: var(--ez-text-default);
  font-size: var(--ez-font-size-xs);
}

.ez-pager__btn:hover:not(:disabled),
.ez-pager__num:hover { background: var(--ez-surface-hover); }

.ez-pager__btn:disabled {
  color: var(--ez-text-disabled);
  cursor: not-allowed;
}

.ez-pager__num--on {
  background: var(--ez-action-primary);
  border-color: var(--ez-action-primary);
  color: var(--ez-action-primary-on);
  font-weight: var(--ez-font-weight-bold);
}

.ez-pager__info {
  padding: 0 var(--ez-space-3);
  font-size: var(--ez-font-size-xs);
  color: var(--ez-text-muted);
}
</style>
