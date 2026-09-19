import { ref, type Ref } from 'vue'
import { toMessage } from './error'

export interface UseListPageResult<T> {
  rows: Ref<T[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  /** 목록을 다시 받아온다. 실패하면 `error`에 문구가 담기고 예외는 던지지 않는다. */
  reload: () => Promise<void>
}

export interface UseListPageOptions<T> {
  /** 조회 성공 후 호출. 페이지 초기화·선택 해제처럼 화면마다 다른 후처리를 여기서 한다. */
  onLoaded?: (rows: T[]) => void
  /**
   * 에러 문구 변환. 기본은 평문 {@link toMessage}.
   *
   * 시스템관리 화면은 오류코드를 접두로 붙인다(운영자가 로그와 대조하는 화면).
   * 그 화면들은 `toMessageWithCode`를 넘긴다 — 기본값을 그대로 쓰면 표시 문구가 바뀐다.
   */
  formatError?: (err: unknown) => string
}

/**
 * 목록 화면의 조회 상태(`rows`/`loading`/`error`)와 try/catch/finally 골격
 * — h-pms 15개 화면에서 추출.
 *
 * 15개 화면이 아래를 기계적으로 반복하고 있던 것을 모았다.
 *
 * ```ts
 * loading.value = true; error.value = null
 * try { rows.value = await fetchX() } catch (e) { error.value = toMessage(e) }
 * finally { loading.value = false }
 * ```
 *
 * **예외를 다시 던지지 않는다.** 목록 조회 실패는 `ErrorBanner`로 화면에 남기는 것이 이
 * 코드베이스의 관례이고(부수 조회만 `notify`를 쓴다), 호출부가 `catch`를 또 감쌀 필요가 없다.
 *
 * 조회를 자동으로 시작하지 않는다 — `onMounted`나 필터 확정 시점에 `reload()`를 호출한다.
 * 화면마다 조회 전 가드(프로젝트 선택 여부 등)가 달라 여기서 시점을 정하면 맞지 않는다.
 */
export function useListPage<T>(
  loader: () => Promise<T[]>,
  options: UseListPageOptions<T> = {},
): UseListPageResult<T> {
  const rows = ref<T[]>([]) as Ref<T[]>
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 조회 순번. 앞선 조회가 늦게 도착해 최신 결과를 덮는 것을 막는다 — 화면/메뉴 관리에서
   * 조건 없는 첫 조회(2천 건)와 시스템 조건 조회가 겹쳐 목록이 전체로 되돌아갔다.
   * 응답 순서는 요청 순서를 따르지 않으므로 마지막으로 시작한 조회만 결과를 반영한다.
   */
  let latest = 0

  async function reload(): Promise<void> {
    const seq = ++latest
    loading.value = true
    error.value = null
    try {
      const loaded = await loader()
      if (seq !== latest) return
      rows.value = loaded
      options.onLoaded?.(loaded)
    } catch (err) {
      if (seq !== latest) return
      error.value = (options.formatError ?? toMessage)(err)
    } finally {
      // 뒤늦게 끝난 조회가 진행 중인 조회의 로딩 표시를 끄면 화면이 먼저 열려 깜빡인다.
      if (seq === latest) loading.value = false
    }
  }

  return { rows, loading, error, reload }
}
