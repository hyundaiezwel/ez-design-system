import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'

export interface UsePaginationResult<T> {
  currentPage: Ref<number>
  pageSize: Ref<number>
  totalPages: ComputedRef<number>
  /** 현재 페이지에 해당하는 구간. */
  paged: ComputedRef<T[]>
}

/**
 * 클라이언트 사이드 페이징. 9개 화면이 아래 3줄을 글자 단위로 같게 복붙해 두고 있었다.
 *
 * ```ts
 * const pageSize = ref(20)
 * const currentPage = ref(1)
 * const totalPages = computed(() => Math.max(1, Math.ceil(rows.value.length / pageSize.value)))
 * ```
 *
 * 서버 페이징이 필요해지면 이 컴포저블을 쓰지 않고 별도로 설계한다 — 여기서 옵션으로
 * 겸용하게 만들면 두 방식이 한 함수에 섞인다.
 *
 * 목록이 줄어 현재 페이지가 범위를 벗어나면 마지막 페이지로 당긴다. 종전 화면들은 이 처리가
 * 없어서 필터를 좁히면 빈 페이지가 보일 수 있었다.
 */
export function usePagination<T>(source: Ref<T[]> | ComputedRef<T[]>, size = 20): UsePaginationResult<T> {
  const pageSize = ref(size)
  const currentPage = ref(1)

  const totalPages = computed(() => Math.max(1, Math.ceil(source.value.length / pageSize.value)))

  watch(totalPages, (pages) => {
    if (currentPage.value > pages) {
      currentPage.value = pages
    }
  })

  const paged = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return source.value.slice(start, start + pageSize.value)
  })

  return { currentPage, pageSize, totalPages, paged }
}
