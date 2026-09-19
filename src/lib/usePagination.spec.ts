import { describe, expect, it } from 'vitest'
import { computed, nextTick, ref } from 'vue'
import { usePagination } from './usePagination'

const rows = (n: number) => Array.from({ length: n }, (_, i) => i + 1)

describe('usePagination', () => {
  it('slices the current page', () => {
    const { paged, currentPage } = usePagination(ref(rows(45)), 20)

    expect(paged.value).toHaveLength(20)
    expect(paged.value[0]).toBe(1)

    currentPage.value = 3
    expect(paged.value).toEqual([41, 42, 43, 44, 45])
  })

  it('reports at least one page even when empty', () => {
    const { totalPages } = usePagination(ref([]), 20)

    // 종전 화면들이 Math.max(1, ...)로 보장했던 동작이다 — 0페이지 표기를 막는다.
    expect(totalPages.value).toBe(1)
  })

  it('pulls the current page back when the list shrinks past it', async () => {
    const source = ref(rows(45))
    const { currentPage, totalPages } = usePagination(source, 20)
    currentPage.value = 3

    source.value = rows(5)
    await nextTick()

    // 종전 화면들에는 이 처리가 없어 필터를 좁히면 빈 페이지가 보일 수 있었다.
    expect(totalPages.value).toBe(1)
    expect(currentPage.value).toBe(1)
  })

  it('follows a computed source', async () => {
    const all = ref(rows(30))
    const evens = computed(() => all.value.filter((n) => n % 2 === 0))
    const { totalPages, paged } = usePagination(evens, 10)

    expect(totalPages.value).toBe(2)
    expect(paged.value[0]).toBe(2)

    all.value = rows(4)
    await nextTick()
    expect(paged.value).toEqual([2, 4])
  })
})
