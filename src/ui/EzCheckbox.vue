<script setup lang="ts">
/**
 * 체크박스 / 라디오.
 *
 * 네이티브 input을 `accent-color`로 칠한다. 가짜 박스를 SVG로 그리면 고대비 모드
 * (Windows 강제 색 모드)에서 사라진다 — 네이티브는 OS가 알아서 그려준다.
 *
 * 선택지가 3개 이상이면 라디오 대신 셀렉트를 쓴다(h-pms CR-COMP 규칙 승계).
 */
withDefaults(
  defineProps<{
    modelValue?: boolean
    label?: string
    value?: string | number
    name?: string
    type?: 'checkbox' | 'radio'
    disabled?: boolean
  }>(),
  { type: 'checkbox' },
)

defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <label class="ez-check" :class="{ 'ez-check--disabled': disabled }">
    <input
      class="ez-check__input"
      :type="type"
      :name="name"
      :value="value"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span class="ez-check__label"><slot>{{ label }}</slot></span>
  </label>
</template>

<style scoped>
.ez-check {
  display: inline-flex;
  align-items: center;
  gap: var(--ez-space-2);
  cursor: pointer;
  font-size: var(--ez-font-size-sm);
  color: var(--ez-text-default);
}

.ez-check--disabled {
  cursor: not-allowed;
  color: var(--ez-text-disabled);
}

.ez-check__input {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: var(--ez-action-primary);
  cursor: inherit;
}
</style>
