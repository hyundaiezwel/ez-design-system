import { describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useFocusTrap } from './useFocusTrap'

/** 모달 한 겹을 흉내 낸다. 바깥 버튼이 있어야 "빠져나가지 않는가"를 볼 수 있다. */
const Host = defineComponent({
  props: { open: { type: Boolean, default: false } },
  setup(props) {
    const panel = ref<HTMLElement | null>(null)
    useFocusTrap(panel, () => props.open)
    return () => [
      h('button', { id: 'outside' }, '바깥'),
      props.open
        ? h('div', { ref: panel }, [
            h('button', { id: 'first' }, '처음'),
            h('button', { id: 'last' }, '끝'),
          ])
        : null,
    ]
  },
})

function tab(shift = false) {
  const e = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: shift, bubbles: true, cancelable: true })
  document.dispatchEvent(e)
  return e
}

describe('useFocusTrap', () => {
  it('열리면 첫 요소로 포커스를 보낸다', async () => {
    const w = mount(Host, { attachTo: document.body, props: { open: false } })
    await w.setProps({ open: true })
    await w.vm.$nextTick()

    expect(document.activeElement?.id).toBe('first')
    w.unmount()
  })

  it('마지막에서 Tab을 누르면 처음으로 돌아온다', async () => {
    const w = mount(Host, { attachTo: document.body, props: { open: true } })
    await w.vm.$nextTick()
    document.querySelector<HTMLElement>('#last')!.focus()

    expect(tab().defaultPrevented).toBe(true)
    expect(document.activeElement?.id).toBe('first')
    w.unmount()
  })

  it('처음에서 Shift+Tab을 누르면 마지막으로 간다', async () => {
    const w = mount(Host, { attachTo: document.body, props: { open: true } })
    await w.vm.$nextTick()
    document.querySelector<HTMLElement>('#first')!.focus()

    expect(tab(true).defaultPrevented).toBe(true)
    expect(document.activeElement?.id).toBe('last')
    w.unmount()
  })

  it('닫히면 열기 전 요소로 포커스를 되돌린다', async () => {
    const w = mount(Host, { attachTo: document.body, props: { open: false } })
    document.querySelector<HTMLElement>('#outside')!.focus()

    await w.setProps({ open: true })
    await w.vm.$nextTick()
    await w.setProps({ open: false })

    expect(document.activeElement?.id).toBe('outside')
    w.unmount()
  })
})
