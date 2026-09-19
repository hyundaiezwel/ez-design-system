<script setup lang="ts">
/**
 * 사이드 패널(우측 Slide-In).
 *
 * 모달과 갈리는 지점: 패널은 **뒤 화면의 맥락을 유지**한다. 목록을 보면서 상세를
 * 편집하는 흐름에 쓴다. 그래서 dim이 선택(`dim` prop)이고, dim이 없으면 뒤 화면을
 * 그대로 조작할 수 있어야 하므로 포커스를 가두지 않는다.
 *
 * dim일 때만 모달과 같은 규칙(포커스 트랩 + Esc)을 적용한다 — 반쯤 모달인 상태가
 * 접근성에서 제일 나쁘다.
 */
import { ref } from 'vue'
import { useEscapeToClose } from '../lib/useEscapeToClose'
import { useFocusTrap } from '../lib/useFocusTrap'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    size?: 'sm' | 'md' | 'lg'
    dim?: boolean
  }>(),
  { size: 'md' },
)

const emit = defineEmits<{ close: [] }>()

const panel = ref<HTMLElement | null>(null)
useEscapeToClose(() => props.open && props.dim === true, () => emit('close'))
useFocusTrap(panel, () => props.open && props.dim === true)
</script>

<template>
  <Teleport to="body">
    <div v-if="open && dim" class="ez-panel-scrim" />
    <Transition name="ez-panel">
      <aside
        v-if="open"
        ref="panel"
        class="ez-panel"
        :class="`ez-panel--${size}`"
        :role="dim ? 'dialog' : 'complementary'"
        :aria-modal="dim || undefined"
        :aria-label="title"
      >
        <header class="ez-panel__head">
          <h2 class="ez-panel__title">{{ title }}</h2>
          <button class="ez-panel__close" type="button" aria-label="닫기" @click="emit('close')">✕</button>
        </header>
        <div class="ez-panel__body ez-scroll"><slot /></div>
        <footer v-if="$slots.footer" class="ez-panel__foot"><slot name="footer" /></footer>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ez-panel-scrim {
  position: fixed;
  inset: 0;
  z-index: var(--ez-z-panel);
  background: var(--ez-surface-scrim);
}

.ez-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: var(--ez-z-panel);
  display: flex;
  flex-direction: column;
  background: var(--ez-surface-raised);
  border-left: 1px solid var(--ez-border-default);
  box-shadow: var(--ez-shadow-modal);
}

.ez-panel--sm { width: 360px; }
.ez-panel--md { width: 520px; }
.ez-panel--lg { width: 720px; }

.ez-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ez-space-4);
  padding: var(--ez-space-4) var(--ez-space-5);
  border-bottom: 1px solid var(--ez-border-subtle);
}

.ez-panel__title {
  font-size: var(--ez-font-size-md);
  font-weight: var(--ez-font-weight-bold);
  color: var(--ez-text-strong);
}

.ez-panel__close {
  width: var(--ez-size-sm);
  height: var(--ez-size-sm);
  border-radius: var(--ez-radius-sm);
  color: var(--ez-icon-default);
}

.ez-panel__close:hover { background: var(--ez-surface-hover); }

.ez-panel__body { flex: 1; padding: var(--ez-space-5); }

.ez-panel__foot {
  display: flex;
  justify-content: flex-end;
  gap: var(--ez-space-2);
  padding: var(--ez-space-4) var(--ez-space-5);
  border-top: 1px solid var(--ez-border-subtle);
}

.ez-panel-enter-active,
.ez-panel-leave-active {
  transition: transform var(--ez-duration-normal) var(--ez-easing-decelerate);
}

.ez-panel-enter-from,
.ez-panel-leave-to {
  transform: translateX(100%);
}
</style>
