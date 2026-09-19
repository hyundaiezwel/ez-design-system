import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * `docs/public/styleguide.html`은 단일 파일로 배포되므로 토큰을 인라인으로 들고 있다
 * (Artifact CSP가 외부 스타일시트를 막는다). 정본이 바뀌면 그 블록이 낡는다.
 *
 * primitive 색 값과, 정본에서 hex를 참조로 바꾼 자리를 여기서 맞춘다.
 * 남은 불일치는 끝에 보고한다 — 조용히 어긋나지 않게 하려는 것이다.
 */
const at = (p) => fileURLToPath(new URL(p, import.meta.url))
const tokens = readFileSync(at('../src/styles/tokens.css'), 'utf8')
const guidePath = at('../docs/public/styleguide.html')
let guide = readFileSync(guidePath, 'utf8')

/** 정본의 primitive 값 */
const canon = new Map()
for (const m of tokens.matchAll(/(--ez-color-[a-z]+-\d+):\s*(#[0-9a-f]{6})/gi)) canon.set(m[1], m[2])
for (const m of tokens.matchAll(/(--ez-brand):\s*(#[0-9a-f]{6})/gi)) canon.set(m[1], m[2])

let updated = 0
guide = guide.replace(/(--ez-color-[a-z]+-\d+:\s*)#[0-9a-f]{6}/gi, (all, head) => {
  const name = head.split(':')[0].trim()
  const v = canon.get(name)
  if (!v || all.endsWith(v)) return all
  updated++
  return head + v
})

/** 정본에서 손으로 고른 hex를 램프 참조로 바꾼 자리들 */
const SEMANTIC = [
  ['--ez-surface-sunken: #1a1d20', '--ez-surface-sunken: var(--ez-color-gray-95)'],
  ['--ez-surface-raised: #2c3035', '--ez-surface-raised: var(--ez-color-gray-80)'],
  ['--ez-surface-hover: #2c3035', '--ez-surface-hover: var(--ez-color-gray-80)'],
  ['--ez-field-bg: #1a1d20', '--ez-field-bg: var(--ez-color-gray-95)'],
  ['--ez-action-secondary-hover: #2c3035', '--ez-action-secondary-hover: var(--ez-color-gray-80)'],
  ['--ez-status-neutral-bg: #2c3035', '--ez-status-neutral-bg: var(--ez-color-gray-80)'],
]
for (const [from, to] of SEMANTIC) {
  if (guide.includes(from)) {
    guide = guide.split(from).join(to)
    updated++
  }
}

/** 다크 의미 토큰 재배치 — 정본과 같은 단계로 */
const DARK = [
  [/(:root\[data-theme="dark"\][\s\S]*?)--ez-text-muted: var\(--ez-color-gray-40\);/, '$1--ez-text-muted: var(--ez-color-gray-30);'],
  [/(:root\[data-theme="dark"\][\s\S]*?)--ez-text-disabled: var\(--ez-color-gray-60\);/, '$1--ez-text-disabled: var(--ez-color-gray-50);'],
  [/(:root\[data-theme="dark"\][\s\S]*?)--ez-icon-default: var\(--ez-color-gray-30\);/, '$1--ez-icon-default: var(--ez-color-gray-20);'],
  [/(:root\[data-theme="dark"\][\s\S]*?)--ez-icon-muted: var\(--ez-color-gray-50\);/, '$1--ez-icon-muted: var(--ez-color-gray-30);'],
  [/(:root\[data-theme="dark"\][\s\S]*?)--ez-border-strong: var\(--ez-color-gray-50\);/, '$1--ez-border-strong: var(--ez-color-gray-40);'],
  [/(:root\[data-theme="dark"\][\s\S]*?)--ez-field-placeholder: var\(--ez-color-gray-50\);/, '$1--ez-field-placeholder: var(--ez-color-gray-40);'],
]
for (const [re, to] of DARK) {
  if (re.test(guide)) {
    guide = guide.replace(re, to)
    updated++
  }
}

writeFileSync(guidePath, guide)

/** 남은 불일치 보고 */
const leftover = []
for (const [name, v] of canon) {
  if (name === '--ez-brand') continue
  const m = guide.match(new RegExp(name + ':\\s*(#[0-9a-f]{6})', 'i'))
  if (!m) leftover.push(`${name} 없음`)
  else if (m[1].toLowerCase() !== v.toLowerCase()) leftover.push(`${name} ${m[1]} ≠ ${v}`)
}
console.log(`스타일가이드 ${updated}곳 갱신`)
if (leftover.length) {
  console.error('남은 불일치:')
  leftover.forEach((l) => console.error('  ' + l))
  process.exit(1)
}
console.log('정본과 일치')
