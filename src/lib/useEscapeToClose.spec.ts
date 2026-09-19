import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useEscapeToClose } from './useEscapeToClose'

const pressEscape = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

// 스택은 모듈 전역이다. 케이스 사이에 남으면 다음 케이스가 그 핸들러를 맞는다.
const hosts: { unmount: () => void }[] = []

afterEach(() => {
  while (hosts.length) hosts.pop()!.unmount()
})

/** isOpen을 외부에서 켜고 끌 수 있는 최소 소비처. */
function makeHost(close: () => void, open = true) {
  const isOpen = ref(open)
  const wrapper = mount(
    defineComponent({
      setup() {
        useEscapeToClose(() => isOpen.value, close)
        return () => h('div')
      },
    }),
  )
  hosts.push(wrapper)
  return { isOpen, wrapper }
}

describe('useEscapeToClose', () => {
  it('closes on Escape while open', () => {
    const close = vi.fn()
    makeHost(close)

    pressEscape()

    expect(close).toHaveBeenCalledTimes(1)
  })

  it('does not close while not open', () => {
    const close = vi.fn()
    makeHost(close, false)

    pressEscape()

    expect(close).not.toHaveBeenCalled()
  })

  /**
   * 배경 클릭 닫기를 없앤 뒤 Esc가 유일한 탈출로가 됐다. 모달이 겹칠 때(헤더 내정보 팝업
   * 위 설정 모달) Esc 한 번에 둘 다 닫히면 사용자는 화면을 잃는다. 위 하나만 닫혀야 한다.
   */
  it('closes only the most recently opened when modals are stacked', () => {
    const outer = vi.fn()
    const inner = vi.fn()
    makeHost(outer)
    makeHost(inner)

    pressEscape()

    expect(inner).toHaveBeenCalledTimes(1)
    expect(outer).not.toHaveBeenCalled()
  })

  it('hands Escape back to the one below after the top closes', async () => {
    const outer = vi.fn()
    const inner = vi.fn()
    makeHost(outer)
    const top = makeHost(inner)

    top.isOpen.value = false
    await nextTick()
    pressEscape()

    expect(outer).toHaveBeenCalledTimes(1)
    expect(inner).not.toHaveBeenCalled()
  })

  it('stops listening once unmounted', () => {
    const close = vi.fn()
    const host = makeHost(close)

    host.wrapper.unmount()
    pressEscape()

    expect(close).not.toHaveBeenCalled()
  })
})
