import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { buildAll, chartPalette, contrast, STEPS } from './palette.mjs'

/**
 * `src/styles/tokens.css`의 primitive 색 값을 생성 결과로 덮어쓴다.
 *
 * 값을 손으로 고치지 못하게 하려는 것이다 — 한 단계만 손대면 step 번호의 약속이 깨진다.
 * 구조·주석은 건드리지 않고 `--ez-color-<계열>-<단계>: #hex;` 줄만 바꾼다.
 */
const path = fileURLToPath(new URL('../src/styles/tokens.css', import.meta.url))
let css = readFileSync(path, 'utf8')
const palette = buildAll()

let n = 0
css = css.replace(/(--ez-color-([a-z]+)-(\d+):\s*)#[0-9a-f]{6}/gi, (all, head, fam, step) => {
  const v = palette[fam]?.[Number(step)]
  if (!v) return all
  n++
  return head + v
})

writeFileSync(path, css)

// 범주형 차트 색
let ch = 0
const chart = chartPalette()
css = css.replace(/(--ez-chart-(\d+):\s*)#[0-9a-f]{6}/gi, (all, head, i) => {
  const v = chart[Number(i) - 1]
  if (!v) return all
  ch++
  return head + v
})
writeFileSync(path, css)

const canvas = palette.gray[10]
console.log(`primitive ${n}개 · 차트 ${ch}개 갱신 · 캔버스 기준 ${canvas}`)
for (const fam of Object.keys(palette)) {
  const line = STEPS.map((s) => `${s}:${contrast(palette[fam][s], canvas).toFixed(1)}`).join(' ')
  console.log(`  ${fam.padEnd(10)} ${line}`)
}
