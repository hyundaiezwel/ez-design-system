import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

export default defineConfig({
  // 프로젝트 페이지는 하위 경로로 뜬다. 로컬은 루트라 기본값 '/'.
  base: process.env.PAGES_BASE || '/',
  lang: 'ko-KR',
  title: 'EZ Design System',
  description: '현대이지웰 업무 시스템 공용 디자인 시스템',
  cleanUrls: true,
  lastUpdated: true,

  // 문서에서 `@ezwel/ui`로 import하면 빌드된 dist가 아니라 src를 본다 —
  // 컴포넌트를 고치면 문서 데모가 바로 따라온다
  vite: {
    resolve: {
      alias: { '@ezwel/ui': fileURLToPath(new URL('../../src', import.meta.url)) },
    },
  },

  themeConfig: {
    nav: [
      { text: '가이드', link: '/foundations' },
      { text: '컴포넌트', link: '/components' },
      { text: '스타일가이드', link: '/styleguide.html', target: '_blank' },
    ],
    sidebar: [
      {
        text: '시작',
        items: [
          { text: '개요', link: '/' },
          { text: '도입', link: '/adoption' },
        ],
      },
      {
        text: '기초',
        items: [
          { text: '토큰', link: '/foundations' },
          { text: '접근성', link: '/accessibility' },
        ],
      },
      {
        text: '만들기',
        items: [
          { text: '컴포넌트', link: '/components' },
          { text: '패턴', link: '/patterns' },
        ],
      },
      {
        text: '근거',
        items: [{ text: '3개 소스 비교 분석', link: '/comparison' }],
      },
    ],
    outline: { level: [2, 3], label: '이 페이지' },
    docFooter: { prev: '이전', next: '다음' },
    lastUpdatedText: '마지막 수정',
    darkModeSwitchLabel: '테마',
    returnToTopLabel: '맨 위로',
    search: { provider: 'local' },
  },
})
