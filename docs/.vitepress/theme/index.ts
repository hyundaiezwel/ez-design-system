import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import * as Ez from '../../../src'
import '../../../src/styles/tokens.css'
import './custom.css'

/**
 * 문서 테마.
 *
 * `base.css`는 **일부러 안 넣는다.** 전역 리셋이라 VitePress 자체 테마(제목 여백, 링크 밑줄,
 * 본문 배경)를 덮어쓴다. 데모에 필요한 몇 줄만 `custom.css`에 `.ez-demo` 아래로 옮겼다.
 *
 * VitePress는 다크를 `html.dark`로 켜고 우리 토큰은 `[data-theme="dark"]`를 본다 —
 * 클래스를 감시해 속성으로 옮긴다. 토큰 파일에 셀렉터를 추가하는 것보다 이쪽이 낫다
 * (토큰 정본이 문서 도구를 알 필요가 없다).
 */
function syncTheme() {
  const root = document.documentElement
  const apply = () => {
    root.dataset.theme = root.classList.contains('dark') ? 'dark' : 'light'
  }
  new MutationObserver(apply).observe(root, { attributes: true, attributeFilter: ['class'] })
  apply()
}

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 모든 Ez* 컴포넌트를 전역 등록한다 — 마크다운에서 import 없이 바로 쓴다
    for (const [name, value] of Object.entries(Ez)) {
      if (name.startsWith('Ez')) app.component(name, value as never)
    }
    if (!import.meta.env.SSR) syncTheme()
  },
} satisfies Theme
