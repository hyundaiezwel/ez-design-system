/**
 * 색 램프 생성 — 값을 눈으로 고르지 않는다.
 *
 * step 번호는 **기준면 대비비의 약속**이다. v1.0.0은 그 기준면을 흰색으로 잡았는데,
 * 실제로 글자가 놓이는 가장 어두운 면은 캔버스(`--ez-surface-canvas` = gray-10)다.
 * 그래서 흰 카드 안에서는 통과하고 페이지 배경 위에서만 미달하는 구멍이 났다
 * (`--ez-text-muted`가 4.48:1 → 3.90:1).
 *
 * v1.1.0부터 **기준면은 캔버스**다. 이러면 두 용도가 한 약속으로 묶인다.
 *
 *   1. 밝은 면 위의 어두운 글자 — 가장 어두운 면(캔버스)에서 통과하면 더 밝은 면에서도 통과한다
 *   2. 색 면 위의 흰 글자      — 캔버스 기준 4.5:1을 넘는 색은 흰 글자 기준으로도 5.1:1이 넘는다
 *
 * 8비트 양자화에서 반올림이 아래로 떨어져 4.48:1이 나오던 문제는 목표에 2% 여유를 둬서 막는다.
 */

const SRGB = (c) => {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

export const luminance = ([r, g, b]) => 0.2126 * SRGB(r) + 0.7152 * SRGB(g) + 0.0722 * SRGB(b)

export const hex2rgb = (h) => {
  const n = parseInt(h.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export const rgb2hex = (rgb) => '#' + rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')

export function contrast(a, b) {
  const [x, y] = [luminance(typeof a === 'string' ? hex2rgb(a) : a), luminance(typeof b === 'string' ? hex2rgb(b) : b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/** HSL → RGB */
function hsl(h, s, l) {
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0) * 255, f(8) * 255, f(4) * 255]
}

/** 목표 상대휘도가 나오는 명도를 이분탐색한다 */
function solve(hue, sat, targetY) {
  let lo = 0
  let hi = 1
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (luminance(hsl(hue, sat, mid)) < targetY) lo = mid
    else hi = mid
  }
  return rgb2hex(hsl(hue, sat, (lo + hi) / 2))
}

/** 밝은 단계의 면 휘도 — 여기는 글자가 아니라 면이라 대비 약속의 대상이 아니다 */
const SURFACE_Y = { 5: 0.93, 10: 0.86, 20: 0.7, 30: 0.48 }

/** 캔버스(step 10) 기준 목표 대비비. 2% 여유를 얹어 양자화 손실을 흡수한다 */
const CONTRAST_TARGET = { 40: 3, 50: 4.5, 60: 5.7, 70: 7, 80: 10, 90: 15 }
const MARGIN = 1.02

/** 캔버스 대비 최대치가 18.2:1이라 95는 대비로 못 잡는다 — 가장 어두운 실용값으로 고정 */
const DARKEST_Y = 0.0035

const CANVAS_Y = SURFACE_Y[10]

/** 밝은 쪽 채도를 낮춘다. 안 낮추면 형광색이 된다 */
const SAT_TAPER = { 5: 0.45, 10: 0.55, 20: 0.7, 30: 0.85, 40: 1, 50: 1, 60: 0.95, 70: 0.9, 80: 0.85, 90: 0.8, 95: 0.75 }

export const STEPS = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95]

export function targetY(step) {
  if (SURFACE_Y[step] !== undefined) return SURFACE_Y[step]
  if (step === 95) return DARKEST_Y
  return (CANVAS_Y + 0.05) / (CONTRAST_TARGET[step] * MARGIN) - 0.05
}

/**
 * @param {number} hue
 * @param {number} sat
 * @param {Record<number,string>} [anchors] 특정 단계를 지정 값으로 고정(브랜드색 등)
 */
export function ramp(hue, sat, anchors = {}) {
  const out = {}
  for (const step of STEPS) {
    out[step] = anchors[step] ?? solve(hue, sat * SAT_TAPER[step], targetY(step))
  }
  return out
}

/**
 * 계열 정의.
 *
 * primary step 40은 사내 관리자센터 표준 주색에 앵커했었지만 **v1.1.0에서 풀었다** —
 * `#009782`는 캔버스 기준 2.6:1이라 새 약속(3:1)을 만족하지 못한다.
 * 브랜드색은 hue(171.7°)로만 계승하고, 표준색 자체는 로고·큰 면적용으로 문서에 남긴다.
 */
export const FAMILIES = {
  gray: { hue: 215, sat: 0.09 },
  primary: { hue: 171.7, sat: 0.95 },
  secondary: { hue: 217, sat: 0.78 },
  success: { hue: 148, sat: 0.66 },
  warning: { hue: 38, sat: 0.95 },
  danger: { hue: 2, sat: 0.78 },
}

/**
 * 차트 팔레트 — Figma 기본 팔레트를 **그대로** 쓴다.
 *
 * v1.6.0은 이 색상각을 캔버스 명도에 맞춰 옮겨 썼는데, 결과가 참조보다 어두웠다.
 * v1.6.1부터는 참조 값을 그대로 둔다 — 톤이 결정 기준이다.
 *
 * ## 이 선택이 포기하는 것
 *
 * **라이트 캔버스에서 셋이 3:1 미달이다.** 주황 2.09 · 초록 1.79 · 하늘 1.75.
 * 면(도넛·누적 막대)은 인접 조각 사이 배경색 획이 경계를 맡으므로 WCAG 1.4.11에
 * 걸리지 않는다. **선 차트는 걸린다** — 선 자체가 정보라 색이 배경과 3:1이어야 한다.
 * 라이트 테마 선 차트에서 이 셋을 쓰면 AA 미달이다. 계열이 둘 이하일 때 쓰는
 * `--ez-chart-1`(파랑 3.64)과 `--ez-chart-muted`는 통과하므로, 선 차트 대부분은 영향이 없다.
 *
 * 다크 캔버스에서는 여섯 색 모두 4.65 이상으로 통과한다.
 *
 * ## 색각이상
 *
 * 패턴(`aria.decal`)을 걷어냈으므로 색이 혼자 선다. 적록 ΔE 10.6 — v1.6.0의 4.0보다는
 * 낫지만 안전선(15~20)에는 못 미친다. 2색각은 명도·청황 두 축만 보므로 여섯 범주를
 * 색상만으로 가르는 조합은 애초에 존재하지 않는다(Okabe-Ito·Tableau 10·IBM Carbon까지
 * 시뮬레이션해도 20을 넘는 6색은 없었다). **범례·직접 라벨·툴팁이 그 몫을 진다.**
 *
 * 7개 이상이 필요하면 계열을 늘리지 말고 묶어서 '기타'로 접는다.
 */
const CHART = ['#2F80ED', '#F2994A', '#6FCF97', '#BB6BD9', '#56CCF2', '#EB5757']

export function chartPalette() {
  return [...CHART]
}

export function buildAll() {
  const out = {}
  for (const [name, { hue, sat, anchors }] of Object.entries(FAMILIES)) {
    out[name] = ramp(hue, sat, anchors)
  }
  out.gray[0] = '#ffffff'
  out.gray[100] = '#000000'
  return out
}
