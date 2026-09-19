import { nextTick, onScopeDispose, watch, type Ref } from 'vue'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * 모달·패널 안에 키보드 포커스를 가둔다.
 *
 * 없으면 Tab을 계속 눌렀을 때 포커스가 뒤에 깔린 화면으로 빠져나간다. 화면은 dim으로
 * 가려져 있으니 **보이지 않는 곳에 포커스가 있는 상태**가 되고, 스크린리더 사용자는
 * 자기가 어디 있는지 알 수 없게 된다. 열릴 때 첫 요소로 보내고, 닫을 때 열기 전
 * 요소로 되돌린다.
 */
export function useFocusTrap(container: Ref<HTMLElement | null>, isOpen: () => boolean) {
  // SSR/SSG에는 포커스라는 개념이 없다 — 브라우저에서 setup이 다시 돌 때 걸린다.
  if (typeof document === 'undefined') return

  let restoreTo: HTMLElement | null = null

  function items(): HTMLElement[] {
    const root = container.value
    if (!root) return []
    const all = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)]
    // 숨겨진 요소는 Tab 순서에서도 빠지므로 제외한다.
    // `offsetParent`로 판정하지 않는다 — 요소 자신이 `position: fixed`면 보이는데도 null이고,
    // jsdom에서는 항상 null이라 이 판정식은 테스트할 수도 없다.
    // `checkVisibility`가 없는 환경(구형 브라우저·jsdom)에서는 거르지 않는다.
    return all.filter((el) => (typeof el.checkVisibility === 'function' ? el.checkVisibility() : true))
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return
    const list = items()
    if (list.length === 0) {
      event.preventDefault()
      return
    }
    const first = list[0]
    const last = list[list.length - 1]
    const active = document.activeElement as HTMLElement | null

    if (event.shiftKey && (active === first || !container.value?.contains(active))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  watch(
    isOpen,
    async (open) => {
      if (open) {
        restoreTo = document.activeElement as HTMLElement | null
        document.addEventListener('keydown', onKeydown, true)
        await nextTick()
        items()[0]?.focus()
      } else {
        document.removeEventListener('keydown', onKeydown, true)
        restoreTo?.focus()
        restoreTo = null
      }
    },
    { immediate: true },
  )

  onScopeDispose(() => document.removeEventListener('keydown', onKeydown, true))
}
