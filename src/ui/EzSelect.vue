<script setup lang="ts">
/**
 * 셀렉트.
 *
 * 네이티브 `<select>`다. 커스텀 드롭다운을 만들지 않은 이유는 키보드·IME·스크린리더·
 * 모바일 휠 동작을 전부 다시 구현해야 하고, 업무 화면 셀렉트는 그 비용을 정당화할
 * 기능(검색·다중·그룹 렌더)이 없기 때문이다. 검색이 필요해지면 그때 별도 컴포넌트를 만든다.
 *
 * 네이티브 화살표는 `padding-right`로 밀리지 않아서(브라우저가 그린다) `appearance:none`으로
 * 끄고 배경 이미지로 그린다. 그래서 `currentColor`를 못 쓰고 테마별 두 벌이 필요하다.
 */
withDefaults(
  defineProps<{
    id?: string
    modelValue?: string | number | null
    options: { value: string | number; label: string; disabled?: boolean }[]
    /** 빈 선택지 문구. 없으면 빈 선택지를 두지 않는다 */
    placeholder?: string
    disabled?: boolean
    invalid?: boolean
    describedBy?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' },
)

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <select
    :id="id"
    class="ez-select"
    :class="[`ez-select--${size}`, { 'ez-select--invalid': invalid }]"
    :value="modelValue ?? ''"
    :disabled="disabled"
    :aria-invalid="invalid || undefined"
    :aria-describedby="describedBy"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option v-if="placeholder" value="">{{ placeholder }}</option>
    <option v-for="opt in options" :key="opt.value" :value="opt.value" :disabled="opt.disabled">
      {{ opt.label }}
    </option>
  </select>
</template>

<style scoped>
.ez-select {
  width: 100%;
  padding: 0 var(--ez-space-8) 0 var(--ez-space-3);
  appearance: none;
  background-color: var(--ez-field-bg);
  background-image: var(--ez-select-chevron);
  background-repeat: no-repeat;
  background-position: right var(--ez-space-3) center;
  color: var(--ez-text-default);
  border: 1px solid var(--ez-field-border);
  border-radius: var(--ez-radius-md);
  font-size: var(--ez-font-size-sm);
}

.ez-select--sm { height: var(--ez-size-sm); }
.ez-select--md { height: var(--ez-size-md); }
.ez-select--lg { height: var(--ez-size-lg); }

.ez-select:hover:not(:disabled) { border-color: var(--ez-field-border-hover); }

.ez-select:disabled {
  background-color: var(--ez-field-bg-disabled);
  color: var(--ez-text-disabled);
  cursor: not-allowed;
}

.ez-select--invalid { border-color: var(--ez-border-danger); }
</style>
