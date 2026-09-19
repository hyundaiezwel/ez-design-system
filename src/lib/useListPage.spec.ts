import { describe, expect, it, vi } from 'vitest'
import { useListPage } from './useListPage'

describe('useListPage', () => {
  it('fills rows and clears loading on success', async () => {
    const { rows, loading, error, reload } = useListPage(async () => [1, 2, 3])

    await reload()

    expect(rows.value).toEqual([1, 2, 3])
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('captures the failure message instead of throwing', async () => {
    const { error, loading, reload } = useListPage(async () => {
      throw new Error('조회에 실패했습니다')
    })

    // 호출부가 catch를 또 감싸지 않도록 예외를 다시 던지지 않는다 — ErrorBanner가 화면에 남긴다.
    await expect(reload()).resolves.toBeUndefined()
    expect(error.value).toBe('조회에 실패했습니다')
    expect(loading.value).toBe(false)
  })

  /**
   * 시스템관리 화면들은 오류코드를 접두로 붙인다. 기본 평문 변환이 강제되면 그 화면의
   * 표시 문구가 조용히 바뀐다 — 그래서 변환기를 주입할 수 있어야 한다.
   */
  it('uses the injected error formatter instead of the plain default', async () => {
    const { error, reload } = useListPage(
      async () => {
        throw new Error('권한이 없습니다')
      },
      { formatError: (err) => `E403: ${(err as Error).message}` },
    )

    await reload()

    expect(error.value).toBe('E403: 권한이 없습니다')
  })

  it('clears a previous error on a successful retry', async () => {
    let fail = true
    const { error, reload } = useListPage(async () => {
      if (fail) throw new Error('일시 오류')
      return [1]
    })

    await reload()
    expect(error.value).toBe('일시 오류')

    fail = false
    await reload()
    expect(error.value).toBeNull()
  })

  it('runs onLoaded with the loaded rows', async () => {
    const onLoaded = vi.fn()
    const { reload } = useListPage(async () => ['a'], { onLoaded })

    await reload()

    expect(onLoaded).toHaveBeenCalledWith(['a'])
  })

  it('does not run onLoaded when the load fails', async () => {
    const onLoaded = vi.fn()
    const { reload } = useListPage(async () => {
      throw new Error('실패')
    }, { onLoaded })

    await reload()

    expect(onLoaded).not.toHaveBeenCalled()
  })

  it('does not load until reload is called', () => {
    const loader = vi.fn(async () => [])
    useListPage(loader)

    // 조회 시점은 화면이 정한다(프로젝트 선택 가드 등이 화면마다 다르다).
    expect(loader).not.toHaveBeenCalled()
  })
})
