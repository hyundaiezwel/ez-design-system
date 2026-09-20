import { copyFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

/**
 * 토큰·리셋은 빌드 대상이 아니라 그냥 CSS다. 원본 그대로 dist에 옮기고,
 * 컴포넌트 스타일까지 셋을 묶은 `all.css`를 만든다 — 소비 쪽 import를 한 줄로 끝내려는 것.
 * Vite가 `@import`를 빌드 시점에 인라인하므로 런타임 요청이 늘지 않는다.
 */
const at = (p) => fileURLToPath(new URL(p, import.meta.url))

await copyFile(at('../src/styles/tokens.css'), at('../dist/tokens.css'))
await copyFile(at('../src/styles/base.css'), at('../dist/base.css'))
await copyFile(at('../src/styles/layout.css'), at('../dist/layout.css'))
await writeFile(
  at('../dist/all.css'),
  "@import './tokens.css';\n@import './base.css';\n@import './layout.css';\n@import './style.css';\n",
)

console.log('dist/tokens.css, dist/base.css, dist/all.css 생성')
