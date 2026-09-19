<script lang="ts">
/**
 * 목록 표.
 *
 * 왜 컴포넌트로 감쌌나 — 업무 화면의 표는 마크업이 아니라 **규칙**이 반복된다.
 * 정렬 축(문자 좌 / 숫자 우 / 상태 가운데), 헤더 고정, 빈 상태, 선택 행 강조,
 * `scope` 속성. 화면마다 `<table>`을 손으로 쓰면 이 중 접근성 두 개가 늘 빠진다.
 *
 * 셀 내용은 슬롯(`cell:<key>`)으로 화면이 그린다 — 렌더 함수를 props로 받으면
 * 템플릿에서 컴포넌트를 쓸 수 없다.
 */
export interface EzColumn {
  key: string
  label: string
  /** 미지정 시 `type`에 따라 정해진다 */
  align?: 'left' | 'center' | 'right'
  /** number는 우측, status는 가운데 정렬이 된다 */
  type?: 'text' | 'number' | 'status'
  width?: string
}
</script>

<script setup lang="ts" generic="T extends Record<string, unknown>">
withDefaults(
  defineProps<{
    columns: EzColumn[]
    rows: T[]
    /** 행 식별자. 없으면 인덱스를 쓰는데, 정렬·삭제 시 Vue가 행을 잘못 재사용한다 */
    rowKey?: (row: T, index: number) => string | number
    /** 표의 용도를 스크린리더에 알린다. 화면에는 안 보인다 */
    caption?: string
    selectedKey?: string | number | null
    /** 세로 스크롤 시 헤더를 고정한다 */
    stickyHeader?: boolean
    emptyText?: string
  }>(),
  { emptyText: '조회 결과가 없습니다.', stickyHeader: true },
)

defineEmits<{ rowClick: [row: T] }>()

function alignOf(col: EzColumn) {
  return col.align ?? (col.type === 'number' ? 'right' : col.type === 'status' ? 'center' : 'left')
}
</script>

<template>
  <div class="ez-table-wrap ez-scroll">
    <table class="ez-table" :class="{ 'ez-table--sticky': stickyHeader }">
      <caption v-if="caption" class="ez-sr-only">{{ caption }}</caption>
      <colgroup>
        <col v-for="col in columns" :key="col.key" :style="col.width ? { width: col.width } : undefined" />
      </colgroup>
      <thead>
        <tr>
          <!-- scope=col이 있어야 스크린리더가 셀을 읽을 때 컬럼명을 함께 읽는다 -->
          <th v-for="col in columns" :key="col.key" scope="col" :style="{ textAlign: alignOf(col) }">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="rows.length === 0">
          <td :colspan="columns.length" class="ez-table__empty">{{ emptyText }}</td>
        </tr>
        <tr
          v-for="(row, i) in rows"
          v-else
          :key="rowKey ? rowKey(row, i) : i"
          :class="{ 'ez-table__row--selected': rowKey && selectedKey === rowKey(row, i) }"
          :aria-selected="rowKey && selectedKey === rowKey(row, i) ? true : undefined"
          @click="$emit('rowClick', row)"
        >
          <td v-for="col in columns" :key="col.key" :style="{ textAlign: alignOf(col) }">
            <slot :name="`cell:${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] ?? '-' }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.ez-table-wrap {
  border: 1px solid var(--ez-border-default);
  border-radius: var(--ez-radius-lg);
  background: var(--ez-surface-default);
}

.ez-table {
  width: 100%;
  font-size: var(--ez-font-size-xs);
}

.ez-table th,
.ez-table td {
  padding: var(--ez-space-2) var(--ez-space-3);
  border-bottom: 1px solid var(--ez-border-subtle);
  line-height: var(--ez-line-height-tight);
}

.ez-table th {
  background: var(--ez-surface-sunken);
  color: var(--ez-text-muted);
  font-weight: var(--ez-font-weight-medium);
  white-space: nowrap;
}

.ez-table--sticky th {
  position: sticky;
  top: 0;
  z-index: var(--ez-z-sticky);
}

.ez-table tbody tr:last-child td { border-bottom: none; }
.ez-table tbody tr:hover { background: var(--ez-surface-hover); }

/* 선택 행은 배경 + 좌측 막대 두 가지로 표시한다 — 배경색만으로는 대비가 1.1:1이라 안 보인다 */
.ez-table__row--selected { background: var(--ez-surface-selected); }
.ez-table__row--selected td:first-child { box-shadow: inset 3px 0 0 var(--ez-action-primary); }

.ez-table__empty {
  padding: var(--ez-space-10);
  text-align: center;
  color: var(--ez-text-muted);
}
</style>
