<script setup lang="ts">
/**
 * 입력 한 칸의 겉틀 — 라벨 · 필수 표시 · 도움말 · 오류 문구.
 *
 * 입력 요소 자체는 슬롯으로 받는다. 겉틀과 컨트롤을 한 컴포넌트에 합치면
 * 셀렉트·날짜·업로드마다 겉틀이 복제된다.
 *
 * 접근성이 이 컴포넌트의 존재 이유다. 슬롯 props로 내려주는 `id`/`describedBy`/`invalid`를
 * 컨트롤에 그대로 바인딩하면 라벨 연결과 오류 안내가 스크린리더까지 도달한다.
 * 색(빨간 테두리)만으로 오류를 표시하지 않는다(WCAG 1.4.1).
 */
import { computed, useId } from 'vue'

const props = defineProps<{
  label: string
  required?: boolean
  help?: string
  /** 검증 실패 문구. 있으면 오류 상태로 그린다 */
  error?: string
  /** 라벨을 화면에서 숨긴다. 스크린리더는 계속 읽는다 */
  labelHidden?: boolean
}>()

const uid = useId()
const controlId = `ez-field-${uid}`
const helpId = `${controlId}-help`
const errorId = `${controlId}-error`

const describedBy = computed(
  () => [props.help ? helpId : null, props.error ? errorId : null].filter(Boolean).join(' ') || undefined,
)
</script>

<template>
  <div class="ez-field" :class="{ 'ez-field--invalid': !!error }">
    <label :for="controlId" class="ez-field__label" :class="{ 'ez-sr-only': labelHidden }">
      {{ label }}
      <!-- '*'만으로는 스크린리더가 "별표"로 읽거나 건너뛴다. 텍스트를 함께 둔다 -->
      <span v-if="required" class="ez-field__required" aria-hidden="true">*</span>
      <span v-if="required" class="ez-sr-only">(필수)</span>
    </label>

    <slot :id="controlId" :described-by="describedBy" :invalid="!!error" />

    <p v-if="help" :id="helpId" class="ez-field__help">{{ help }}</p>
    <!-- role=alert이라 값이 채워지는 순간 읽힌다 -->
    <p v-if="error" :id="errorId" class="ez-field__error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.ez-field {
  display: flex;
  flex-direction: column;
  gap: var(--ez-space-1);
}

.ez-field__label {
  font-size: var(--ez-font-size-xs);
  font-weight: var(--ez-font-weight-medium);
  color: var(--ez-text-default);
}

.ez-field__required {
  color: var(--ez-text-danger);
  margin-left: 2px;
}

.ez-field__help {
  font-size: var(--ez-font-size-2xs);
  color: var(--ez-text-muted);
}

.ez-field__error {
  font-size: var(--ez-font-size-2xs);
  color: var(--ez-text-danger);
}
</style>
