/**
 * 응답 봉투 `{success, data, error:{code, message, fields}}`의 오류를 담는 예외.
 *
 * `fields`는 항목별 검증 오류다 — 폼이 필드 밑에 문구를 붙일 때 쓴다
 * (`04-patterns.md` §2 입력 폼).
 */
export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * 사용자에게 보여줄 오류 문구.
 *
 * 서버 응답 봉투의 `error.message`가 이미 사람이 읽는 문장이라는 전제다. 그 전제가 서면
 * 프론트가 코드별 문구 맵을 들고 있을 필요가 없다 — h-pms에서 17개 화면이 각자 복붙하던
 * 변환 함수가 전부 이 한 줄이었다.
 */
export function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

/**
 * 오류 코드를 앞에 붙인 문구(`HOLIDAY_ALREADY_EXISTS: 이미 등록된 휴무일입니다`).
 *
 * 운영자·관리자 화면에서만 쓴다. 코드가 문의·로그 대조에 쓸모가 있는 화면이다.
 * 일반 사용자 화면에는 {@link toMessage}를 쓴다.
 */
export function toMessageWithCode(err: unknown): string {
  return err instanceof ApiError ? `${err.code}: ${err.message}` : toMessage(err)
}

/** 검증 실패 항목 맵. 폼이 아닌 곳에서는 비어 있다. */
export function toFieldErrors(err: unknown): Record<string, string> {
  return err instanceof ApiError ? (err.fields ?? {}) : {}
}
