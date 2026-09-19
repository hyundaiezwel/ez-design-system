import { reactive, readonly } from 'vue'

export type ToastTone = 'info' | 'success' | 'warning' | 'danger'

export interface Toast {
  id: number
  tone: ToastTone
  message: string
}

const items = reactive<Toast[]>([])
let seq = 0

/**
 * 토스트 큐. Pinia를 쓰지 않는 이유는 상태가 배열 하나라 스토어의 구조가 얹을 게 없어서다.
 *
 * 노출 시간은 tone에 따라 다르다 — 오류는 읽는 데 시간이 걸리고, 놓치면 사용자가
 * 무엇이 실패했는지 알 방법이 없다.
 */
const DURATION: Record<ToastTone, number> = {
  info: 3000,
  success: 3000,
  warning: 5000,
  danger: 6000,
}

export function notify(message: string, tone: ToastTone = 'info') {
  const toast: Toast = { id: ++seq, tone, message }
  items.push(toast)
  setTimeout(() => dismiss(toast.id), DURATION[tone])
  return toast.id
}

export function dismiss(id: number) {
  const i = items.findIndex((t) => t.id === id)
  if (i >= 0) items.splice(i, 1)
}

/**
 * 읽기 전용 뷰. 호스트 컴포넌트가 배열을 직접 건드리지 못하게 한다.
 *
 * 타입을 명시하는 이유 — `readonly()`의 추론 타입이 `@vue/reactivity` 내부 심볼을 참조해
 * d.ts 생성이 TS4023으로 깨진다. 소비 쪽에 필요한 것은 "읽기만 되는 Toast 배열"뿐이다.
 */
export const toasts = readonly(items) as readonly Toast[]
