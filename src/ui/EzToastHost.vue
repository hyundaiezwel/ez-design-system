<script setup lang="ts">
/**
 * 토스트 표시 지점. 앱 루트에 한 번만 둔다.
 *
 * `aria-live="polite"`라 스크린리더가 읽던 것을 끊지 않고 이어 읽는다. 오류 토스트도
 * polite인 이유 — assertive는 입력 중에도 낭독을 끊어버려서 폼 작성을 방해한다.
 * 정말 끊어야 하는 것(세션 만료 등)은 토스트가 아니라 모달로 띄운다.
 */
import { toasts, dismiss } from '../lib/toastState'
</script>

<template>
  <div class="ez-toasts" role="status" aria-live="polite">
    <TransitionGroup name="ez-toast">
      <div v-for="t in toasts" :key="t.id" class="ez-toast" :class="`ez-toast--${t.tone}`">
        <span class="ez-toast__msg">{{ t.message }}</span>
        <button class="ez-toast__x" type="button" aria-label="알림 닫기" @click="dismiss(t.id)">✕</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.ez-toasts {
  position: fixed;
  right: var(--ez-space-6);
  bottom: var(--ez-space-6);
  z-index: var(--ez-z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--ez-space-2);
}

.ez-toast {
  display: flex;
  align-items: center;
  gap: var(--ez-space-3);
  min-width: 260px;
  max-width: 420px;
  padding: var(--ez-space-3) var(--ez-space-4);
  border: 1px solid;
  border-radius: var(--ez-radius-md);
  box-shadow: var(--ez-shadow-overlay);
  font-size: var(--ez-font-size-xs);
}

.ez-toast--info    { color: var(--ez-status-info-fg);    background: var(--ez-status-info-bg);    border-color: var(--ez-status-info-bd); }
.ez-toast--success { color: var(--ez-status-success-fg); background: var(--ez-status-success-bg); border-color: var(--ez-status-success-bd); }
.ez-toast--warning { color: var(--ez-status-warning-fg); background: var(--ez-status-warning-bg); border-color: var(--ez-status-warning-bd); }
.ez-toast--danger  { color: var(--ez-status-danger-fg);  background: var(--ez-status-danger-bg);  border-color: var(--ez-status-danger-bd); }

.ez-toast__msg { flex: 1; }
.ez-toast__x { color: inherit; opacity: 0.7; }
.ez-toast__x:hover { opacity: 1; }

.ez-toast-enter-active,
.ez-toast-leave-active {
  transition:
    opacity var(--ez-duration-normal) var(--ez-easing-standard),
    transform var(--ez-duration-normal) var(--ez-easing-standard);
}

.ez-toast-enter-from,
.ez-toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
