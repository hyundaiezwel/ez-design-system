<script setup lang="ts">
/**
 * 공통 버튼.
 *
 * 규칙(`03-components.md` §1):
 * - 한 화면에 `primary`는 하나다. 둘이면 사용자가 무엇이 주 동작인지 못 고른다.
 * - 파괴적 동작(`danger`)은 확인 Alert를 거친다 — 이 컴포넌트가 강제하지는 않는다.
 * - `loading` 중에는 자동으로 비활성이다. 저장 버튼 중복 클릭을 막는 유일한 장치라
 *   호출부가 `disabled`를 따로 걸 필요가 없다.
 */
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean
    /** 아이콘만 있는 버튼. 이때 `aria-label`을 반드시 넘긴다 */
    iconOnly?: boolean
  }>(),
  { variant: 'secondary', size: 'md', type: 'button' },
)
</script>

<template>
  <button
    class="ez-btn"
    :class="[`ez-btn--${variant}`, `ez-btn--${size}`, { 'ez-btn--icon': iconOnly }]"
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
  >
    <span v-if="loading" class="ez-btn__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.ez-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ez-space-2);
  padding: 0 var(--ez-space-4);
  border: 1px solid transparent;
  border-radius: var(--ez-radius-md);
  font-size: var(--ez-font-size-sm);
  font-weight: var(--ez-font-weight-medium);
  line-height: 1;
  white-space: nowrap;
  transition:
    background-color var(--ez-duration-fast) var(--ez-easing-standard),
    border-color var(--ez-duration-fast) var(--ez-easing-standard);
}

.ez-btn--sm { height: var(--ez-size-sm); padding: 0 var(--ez-space-3); font-size: var(--ez-font-size-xs); }
.ez-btn--md { height: var(--ez-size-md); }
.ez-btn--lg { height: var(--ez-size-lg); padding: 0 var(--ez-space-5); font-size: var(--ez-font-size-md); }

/* 정사각형. 터치 목표 24px 하한(WCAG 2.5.8)은 sm(28px)도 넘는다 */
.ez-btn--icon { padding: 0; aspect-ratio: 1; }

.ez-btn--primary {
  background: var(--ez-action-primary);
  color: var(--ez-action-primary-on);
}
.ez-btn--primary:hover:not(:disabled) { background: var(--ez-action-primary-hover); }
.ez-btn--primary:active:not(:disabled) { background: var(--ez-action-primary-pressed); }

.ez-btn--secondary {
  background: var(--ez-action-secondary);
  color: var(--ez-action-secondary-on);
  border-color: var(--ez-action-secondary-border);
}
.ez-btn--secondary:hover:not(:disabled) { background: var(--ez-action-secondary-hover); }
.ez-btn--secondary:active:not(:disabled) { background: var(--ez-action-secondary-pressed); }

.ez-btn--ghost {
  background: transparent;
  color: var(--ez-text-default);
}
.ez-btn--ghost:hover:not(:disabled) { background: var(--ez-surface-hover); }

.ez-btn--danger {
  background: var(--ez-action-danger);
  color: var(--ez-action-danger-on);
}
.ez-btn--danger:hover:not(:disabled) { background: var(--ez-action-danger-hover); }

.ez-btn:disabled {
  background: var(--ez-action-disabled);
  color: var(--ez-action-disabled-on);
  border-color: transparent;
}

.ez-btn__spinner {
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: var(--ez-radius-full);
  animation: ez-btn-spin 600ms linear infinite;
}

@keyframes ez-btn-spin {
  to { transform: rotate(360deg); }
}

/* 모션 축소에서는 회전 대신 깜빡임으로 바꾼다 — 진행 중임은 계속 보여야 한다 */
@media (prefers-reduced-motion: reduce) {
  .ez-btn__spinner { animation: ez-btn-blink 1.2s steps(2, start) infinite; }
  @keyframes ez-btn-blink { 50% { opacity: 0.3; } }
}
</style>
