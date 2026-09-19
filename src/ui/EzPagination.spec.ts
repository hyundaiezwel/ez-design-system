import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import EzPagination from './EzPagination.vue'

describe('EzPagination', () => {
  it('numbers 모드는 현재 페이지가 낀 10개 묶음만 그린다', () => {
    const w = mount(EzPagination, { props: { page: 23, totalPages: 47, mode: 'numbers' } })
    const nums = w.findAll('.ez-pager__num').map((n) => n.text())

    expect(nums).toEqual(['21', '22', '23', '24', '25', '26', '27', '28', '29', '30'])
  })

  it('마지막 묶음은 totalPages에서 끊긴다', () => {
    const w = mount(EzPagination, { props: { page: 45, totalPages: 47, mode: 'numbers' } })

    expect(w.findAll('.ez-pager__num').map((n) => n.text())).toEqual(['41', '42', '43', '44', '45', '46', '47'])
  })

  it('현재 페이지에 aria-current=page를 준다', () => {
    const w = mount(EzPagination, { props: { page: 3, totalPages: 9, mode: 'numbers' } })

    expect(w.findAll('[aria-current="page"]').map((n) => n.text())).toEqual(['3'])
  })

  it('범위를 벗어난 이동은 잘라낸다', async () => {
    const w = mount(EzPagination, { props: { page: 1, totalPages: 3 } })
    await w.findAll('.ez-pager__btn')[0].trigger('click')

    expect(w.emitted('update:page')).toBeUndefined()
  })
})
