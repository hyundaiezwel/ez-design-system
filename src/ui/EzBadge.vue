<script setup lang="ts">
/**
 * 상태 뱃지.
 *
 * `tone`은 fg/bg/bd 3종 토큰 세트를 한 덩어리로 가져온다 — 색을 하나만 떼어 쓰면
 * 대비가 깨진다(h-pms 구 팔레트 `--green` on `--green-bg`가 2.18:1이었다).
 *
 * **업무 상태값을 tone에 직접 매핑하지 않는다.** 상태 → tone 매핑은 공통코드
 * (`common_code.attrs`)에서 내려받는다(`04-patterns.md` §4).
 */
withDefaults(
  defineProps<{
    tone?: 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'danger'
    size?: 'sm' | 'md'
    /** 점 표시를 앞에 붙인다. 색각이상 사용자에게 색 외 단서를 하나 더 준다 */
    dot?: boolean
  }>(),
  { tone: 'neutral', size: 'md' },
)
</script>

<template>
  <span class="ez-badge" :class="[`ez-badge--${tone}`, `ez-badge--${size}`]">
    <span v-if="dot" class="ez-badge__dot" aria-hidden="true" />
    <slot />
  </span>
</template>

<style scoped>
.ez-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--ez-space-1);
  padding: 2px var(--ez-space-2);
  border: 1px solid;
  border-radius: var(--ez-radius-sm);
  font-size: var(--ez-font-size-2xs);
  font-weight: var(--ez-font-weight-medium);
  line-height: var(--ez-line-height-tight);
  white-space: nowrap;
}

.ez-badge--sm { padding: 1px var(--ez-space-1); }

.ez-badge__dot {
  width: 5px;
  height: 5px;
  border-radius: var(--ez-radius-full);
  background: currentColor;
}

.ez-badge--neutral { color: var(--ez-status-neutral-fg); background: var(--ez-status-neutral-bg); border-color: var(--ez-status-neutral-bd); }
.ez-badge--brand   { color: var(--ez-status-brand-fg);   background: var(--ez-status-brand-bg);   border-color: var(--ez-status-brand-bd); }
.ez-badge--info    { color: var(--ez-status-info-fg);    background: var(--ez-status-info-bg);    border-color: var(--ez-status-info-bd); }
.ez-badge--success { color: var(--ez-status-success-fg); background: var(--ez-status-success-bg); border-color: var(--ez-status-success-bd); }
.ez-badge--warning { color: var(--ez-status-warning-fg); background: var(--ez-status-warning-bg); border-color: var(--ez-status-warning-bd); }
.ez-badge--danger  { color: var(--ez-status-danger-fg);  background: var(--ez-status-danger-bg);  border-color: var(--ez-status-danger-bd); }
</style>
