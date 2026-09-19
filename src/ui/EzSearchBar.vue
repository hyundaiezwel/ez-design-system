<script setup lang="ts">
/**
 * 조회 영역.
 *
 * 업무 시스템에서 가장 많이 복제되는 덩어리다. 화면마다 다른 것은 **조건 필드뿐**이고
 * 나머지(1~2줄 기본 + 상세검색 접기 · 초기화 · 조회 · Enter/F2 단축키)는 전부 같다.
 * 그래서 필드만 슬롯으로 받고 나머지를 여기서 갖는다.
 *
 * 폼(`<form>`)으로 감싼 이유는 Enter 조회를 직접 구현하지 않기 위해서다 —
 * 브라우저 기본 동작이 이미 그 일을 한다. F2만 따로 듣는다(현업 관행).
 */
import { onMounted, onUnmounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 상세검색 영역이 처음부터 펼쳐져 있는지 */
    expanded?: boolean
    loading?: boolean
  }>(),
  { expanded: false },
)

const emit = defineEmits<{ search: []; reset: [] }>()

const open = ref(props.expanded)

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'F2') return
  event.preventDefault()
  emit('search')
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <form class="ez-sfb" role="search" @submit.prevent="emit('search')">
    <div class="ez-sfb__row">
      <div class="ez-sfb__fields"><slot /></div>

      <div class="ez-sfb__actions">
        <button
          v-if="$slots.advanced"
          class="ez-sfb__more"
          type="button"
          :aria-expanded="open"
          aria-controls="ez-sfb-advanced"
          @click="open = !open"
        >
          상세검색
          <span class="ez-sfb__chev" :class="{ 'ez-sfb__chev--open': open }" aria-hidden="true">⌄</span>
        </button>
        <button class="ez-sfb__btn" type="button" @click="emit('reset')">초기화</button>
        <button class="ez-sfb__btn ez-sfb__btn--primary" type="submit" :disabled="loading">조회</button>
      </div>
    </div>

    <!-- 접혀 있어도 DOM에 남긴다(v-show) — 접기 후에도 조건 값이 유지돼야 한다 -->
    <div v-show="open" id="ez-sfb-advanced" class="ez-sfb__advanced">
      <slot name="advanced" />
    </div>
  </form>
</template>

<style scoped>
.ez-sfb {
  padding: var(--ez-space-3) var(--ez-space-4);
  background: var(--ez-surface-default);
  border: 1px solid var(--ez-border-default);
  border-radius: var(--ez-radius-lg);
}

.ez-sfb__row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--ez-space-4);
}

.ez-sfb__fields {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--ez-space-3);
  flex: 1;
}

.ez-sfb__actions {
  display: flex;
  align-items: center;
  gap: var(--ez-space-2);
  flex-shrink: 0;
}

.ez-sfb__more {
  display: inline-flex;
  align-items: center;
  gap: var(--ez-space-1);
  height: var(--ez-size-md);
  padding: 0 var(--ez-space-2);
  font-size: var(--ez-font-size-xs);
  color: var(--ez-text-muted);
}

.ez-sfb__chev { transition: transform var(--ez-duration-fast) var(--ez-easing-standard); }
.ez-sfb__chev--open { transform: rotate(180deg); }

.ez-sfb__btn {
  height: var(--ez-size-md);
  padding: 0 var(--ez-space-4);
  border: 1px solid var(--ez-action-secondary-border);
  border-radius: var(--ez-radius-md);
  background: var(--ez-action-secondary);
  color: var(--ez-action-secondary-on);
  font-size: var(--ez-font-size-sm);
  font-weight: var(--ez-font-weight-medium);
}

.ez-sfb__btn--primary {
  background: var(--ez-action-primary);
  border-color: var(--ez-action-primary);
  color: var(--ez-action-primary-on);
}

.ez-sfb__btn--primary:disabled {
  background: var(--ez-action-disabled);
  border-color: transparent;
  color: var(--ez-action-disabled-on);
}

.ez-sfb__advanced {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ez-space-3);
  margin-top: var(--ez-space-3);
  padding-top: var(--ez-space-3);
  border-top: 1px dashed var(--ez-border-subtle);
}
</style>
