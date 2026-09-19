import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { contrast } from './palette.mjs'

/**
 * 토큰 대비 검사 — `tokens.css`를 읽어 **의미 토큰 조합**이 WCAG AA를 만족하는지 본다.
 *
 * 왜 필요한가 — v1.0.0은 primitive 단계만 계산해 두고 semantic 조합은 안 봤다.
 * 그래서 `--ez-text-muted`가 흰 면에서는 통과하고 캔버스 위에서만 미달하는 것을
 * 실제 화면을 렌더해 재기 전까지 몰랐다. 이 스크립트가 그 구멍을 막는다.
 *
 * 실행: node scripts/check-contrast.mjs
 */

const css = readFileSync(fileURLToPath(new URL('../src/styles/tokens.css', import.meta.url)), 'utf8')

/** `선택자 { ... }` 블록에서 `--var: value` 를 뽑는다 */
function block(selector) {
  const i = css.indexOf(selector + ' {')
  if (i < 0) throw new Error(`블록 없음: ${selector}`)
  const body = css.slice(i + selector.length + 2, css.indexOf('\n}', i))
  const out = {}
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim()
  return out
}

const base = block(':root')
const dark = block(":root[data-theme='dark']")
const high = block(":root[data-contrast='high']")
const darkHigh = block(":root[data-theme='dark'][data-contrast='high']")

/** `var(--x)` 를 끝까지 따라간다. 색이 아니면 null */
function resolve(map, name, depth = 0) {
  if (depth > 12) return null
  const v = map[name]
  if (!v) return null
  const m = v.match(/^var\((--[\w-]+)\)$/)
  if (m) return resolve(map, m[1], depth + 1)
  if (/^#[0-9a-f]{6}$/i.test(v)) return v
  return null // transparent, rgba(), url() 등은 검사 대상이 아니다
}

const THEMES = {
  light: { ...base },
  dark: { ...base, ...dark },
  'light+high': { ...base, ...high },
  'dark+high': { ...base, ...dark, ...darkHigh },
}

/** [글자 토큰, 배경 토큰, 최소 대비] */
const SURFACES = ['--ez-surface-canvas', '--ez-surface-sunken', '--ez-surface-default', '--ez-surface-raised', '--ez-surface-hover']
const BODY_TEXT = ['--ez-text-strong', '--ez-text-default', '--ez-text-muted', '--ez-text-brand', '--ez-text-danger', '--ez-text-success', '--ez-text-warning', '--ez-text-link']
const UI_ON_SURFACE = ['--ez-icon-default', '--ez-icon-muted', '--ez-border-strong']

const PAIRS = [
  ...BODY_TEXT.flatMap((fg) => SURFACES.map((bg) => [fg, bg, 4.5])),
  ...UI_ON_SURFACE.flatMap((fg) => SURFACES.map((bg) => [fg, bg, 3])),
  ['--ez-action-primary-on', '--ez-action-primary', 4.5],
  ['--ez-action-primary-on', '--ez-action-primary-hover', 4.5],
  ['--ez-action-primary-on', '--ez-action-primary-pressed', 4.5],
  ['--ez-action-secondary-on', '--ez-action-secondary', 4.5],
  ['--ez-action-secondary-on', '--ez-action-secondary-hover', 4.5],
  ['--ez-action-danger-on', '--ez-action-danger', 4.5],
  ['--ez-action-danger-on', '--ez-action-danger-hover', 4.5],
  ['--ez-field-placeholder', '--ez-field-bg', 4.5],
  ['--ez-field-placeholder', '--ez-field-bg-readonly', 4.5],
  ...['neutral', 'brand', 'info', 'success', 'warning', 'danger'].map((t) => [
    `--ez-status-${t}-fg`,
    `--ez-status-${t}-bg`,
    4.5,
  ]),
]

let failed = 0
let checked = 0
let skipped = 0

for (const [theme, map] of Object.entries(THEMES)) {
  const bad = []
  for (const [fgName, bgName, need] of PAIRS) {
    const fg = resolve(map, fgName)
    const bg = resolve(map, bgName)
    if (!fg || !bg) {
      skipped++
      continue
    }
    checked++
    const r = contrast(fg, bg)
    if (r < need) bad.push(`    ${fgName} on ${bgName}  ${r.toFixed(2)} < ${need}`)
  }
  if (bad.length) {
    failed += bad.length
    console.error(`  ${theme}: ${bad.length}건 미달`)
    bad.forEach((l) => console.error(l))
  } else {
    console.log(`  ${theme}: 통과`)
  }
}

console.log(`\n검사 ${checked}쌍 · 건너뜀 ${skipped}쌍(색이 아닌 값) · 미달 ${failed}건`)
if (failed) {
  console.error('\n대비 미달이 있다. 토큰을 고치거나 scripts/palette.mjs 목표를 다시 잡아라.')
  process.exit(1)
}
