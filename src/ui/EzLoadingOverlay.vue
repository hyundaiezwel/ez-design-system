<script setup lang="ts">
/**
 * 전체 화면 로딩.
 *
 * 노출 규칙(h-pms CR-COMP-013을 그대로 승계): **1초 미만이면 띄우지 않는다.**
 * 순식간에 떴다 사라지는 오버레이가 깜빡임으로 읽히기 때문이다.
 * `delay`가 그 지연이고, 호출부는 `show`만 토글하면 된다.
 */
import { ref, watch, onScopeDispose } from 'vue'

const props = withDefaults(
  defineProps<{
    show: boolean
    message?: string
    /** 이 시간(ms) 안에 끝나면 오버레이를 아예 띄우지 않는다 */
    delay?: number
  }>(),
  { message: '로딩중입니다 잠시만 기다려 주세요', delay: 1000 },
)

const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

watch(
  () => props.show,
  (on) => {
    clearTimeout(timer)
    if (!on) {
      visible.value = false
      return
    }
    timer = setTimeout(() => (visible.value = true), props.delay)
  },
  { immediate: true },
)

onScopeDispose(() => clearTimeout(timer))
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="ez-loading" role="alert" aria-live="assertive">
      <div class="ez-loading__box">
        <span class="ez-loading__spinner" aria-hidden="true" />
        <p class="ez-loading__msg">{{ message }}</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.ez-loading {
  position: fixed;
  inset: 0;
  z-index: var(--ez-z-modal);
  display: grid;
  place-items: center;
  background: var(--ez-surface-scrim);
  backdrop-filter: blur(2px);
}

.ez-loading__box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ez-space-3);
  padding: var(--ez-space-6) var(--ez-space-8);
  background: var(--ez-surface-raised);
  border-radius: var(--ez-radius-lg);
  box-shadow: var(--ez-shadow-modal);
}

.ez-loading__spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--ez-border-default);
  border-top-color: var(--ez-action-primary);
  border-radius: var(--ez-radius-full);
  animation: ez-loading-spin 700ms linear infinite;
}

.ez-loading__msg {
  font-size: var(--ez-font-size-sm);
  color: var(--ez-text-default);
}

@keyframes ez-loading-spin { to { transform: rotate(360deg); } }

@media (prefers-reduced-motion: reduce) {
  .ez-loading__spinner { animation-duration: 2s; }
}
</style>
