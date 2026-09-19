<script setup lang="ts">
/**
 * 한 줄 입력. `EzField` 안에 넣어 쓴다.
 *
 * `readonly`와 `disabled`를 구분한다 — readonly는 값이 의미 있고 복사·포커스가 되며
 * 폼 전송에 포함된다. 상태에 따라 읽기전용이 되는 업무 화면은 disabled가 아니라 readonly다.
 */
withDefaults(
  defineProps<{
    id?: string
    modelValue?: string | number | null
    type?: 'text' | 'number' | 'email' | 'tel' | 'search' | 'date'
    placeholder?: string
    maxlength?: number
    readonly?: boolean
    disabled?: boolean
    invalid?: boolean
    describedBy?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { type: 'text', size: 'md' },
)

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <input
    :id="id"
    class="ez-input"
    :class="[`ez-input--${size}`, { 'ez-input--invalid': invalid }]"
    :type="type"
    :value="modelValue ?? ''"
    :placeholder="placeholder"
    :maxlength="maxlength"
    :readonly="readonly"
    :disabled="disabled"
    :aria-invalid="invalid || undefined"
    :aria-describedby="describedBy"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<style scoped>
.ez-input {
  width: 100%;
  padding: 0 var(--ez-space-3);
  background: var(--ez-field-bg);
  color: var(--ez-text-default);
  border: 1px solid var(--ez-field-border);
  border-radius: var(--ez-radius-md);
  font-size: var(--ez-font-size-sm);
  transition: border-color var(--ez-duration-fast) var(--ez-easing-standard);
}

.ez-input--sm { height: var(--ez-size-sm); }
.ez-input--md { height: var(--ez-size-md); }
.ez-input--lg { height: var(--ez-size-lg); }

.ez-input::placeholder { color: var(--ez-field-placeholder); }
.ez-input:hover:not(:disabled):not([readonly]) { border-color: var(--ez-field-border-hover); }

.ez-input[readonly] {
  background: var(--ez-field-bg-readonly);
  color: var(--ez-text-muted);
}

.ez-input:disabled {
  background: var(--ez-field-bg-disabled);
  color: var(--ez-text-disabled);
  cursor: not-allowed;
}

.ez-input--invalid { border-color: var(--ez-border-danger); }
</style>
