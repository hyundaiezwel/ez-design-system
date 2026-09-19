<script setup lang="ts">
/**
 * 레이어 팝업(중앙 · dim).
 *
 * 닫히는 길은 **Esc와 닫기 버튼 둘뿐**이다. 배경 클릭 닫기를 넣지 않은 이유는
 * 입력 중 오클릭으로 작성분이 날아가기 때문이다(h-pms에서 실제로 겪고 뺀 동작).
 *
 * `size`를 안 주면 내용 폭에 맞춘다(min 400 / max 90vw).
 */
import { ref } from 'vue'
import { useEscapeToClose } from '../lib/useEscapeToClose'
import { useFocusTrap } from '../lib/useFocusTrap'

const props = defineProps<{
  open: boolean
  title: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}>()

const emit = defineEmits<{ close: [] }>()

const panel = ref<HTMLElement | null>(null)
useEscapeToClose(() => props.open, () => emit('close'))
useFocusTrap(panel, () => props.open)
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="ez-modal-scrim">
      <div
        ref="panel"
        class="ez-modal"
        :class="size ? `ez-modal--${size}` : undefined"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <header class="ez-modal__head">
          <h2 class="ez-modal__title">{{ title }}</h2>
          <button class="ez-modal__close" type="button" aria-label="닫기" @click="emit('close')">✕</button>
        </header>

        <div class="ez-modal__body ez-scroll"><slot /></div>

        <footer v-if="$slots.footer" class="ez-modal__foot"><slot name="footer" /></footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.ez-modal-scrim {
  position: fixed;
  inset: 0;
  z-index: var(--ez-z-modal);
  display: grid;
  place-items: center;
  padding: var(--ez-space-6);
  background: var(--ez-surface-scrim);
}

.ez-modal {
  display: flex;
  flex-direction: column;
  min-width: 400px;
  max-width: 90vw;
  max-height: 85vh;
  background: var(--ez-surface-raised);
  border-radius: var(--ez-radius-lg);
  box-shadow: var(--ez-shadow-modal);
}

.ez-modal--sm { width: 360px; min-width: 0; }
.ez-modal--md { width: 520px; }
.ez-modal--lg { width: 720px; }
.ez-modal--xl { width: 960px; }

.ez-modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ez-space-4);
  padding: var(--ez-space-4) var(--ez-space-5);
  border-bottom: 1px solid var(--ez-border-subtle);
}

.ez-modal__title {
  font-size: var(--ez-font-size-md);
  font-weight: var(--ez-font-weight-bold);
  color: var(--ez-text-strong);
}

.ez-modal__close {
  width: var(--ez-size-sm);
  height: var(--ez-size-sm);
  border-radius: var(--ez-radius-sm);
  color: var(--ez-icon-default);
}

.ez-modal__close:hover { background: var(--ez-surface-hover); }

.ez-modal__body {
  flex: 1;
  padding: var(--ez-space-5);
}

.ez-modal__foot {
  display: flex;
  justify-content: flex-end;
  gap: var(--ez-space-2);
  padding: var(--ez-space-4) var(--ez-space-5);
  border-top: 1px solid var(--ez-border-subtle);
}
</style>
