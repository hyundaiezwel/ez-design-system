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
 * 차트 팔레트 — **테마별 두 벌**이다.
 *
 * v1.5.2까지는 한 벌로 라이트·다크를 모두 만족시키려 했다. 그게 화면이 칙칙했던
 * 원인이다: 두 캔버스 모두에서 3:1을 넘는 명도 구간은 전체의 18%(v=100~140)뿐이라,
 * 여섯 색을 그 띠에 욱여넣으면 명도가 서로 같아지고 같은 명도로 다른 색상을 만들려면
 * 채도를 깎게 된다. 실측으로 평균 채도 C* 38, 최소 ΔE 15.6까지 떨어져 있었다.
 *
 * 테마를 갈라 각자 자기 배경의 명도 범위를 다 쓰게 하면 채도를 깎을 이유가 없어진다.
 * 색상각은 Figma 기본 팔레트에서 가져왔고(참조 톤), 명도만 캔버스에 맞춰 사다리로 벌린다.
 * 흰 캔버스는 L* 58 아래에서만 3:1이 나오므로 라이트 쪽 폭은 **아래로** 만든다.
 *
 * HSL이 아니라 LCh로 잡는다 — 같은 L*이면 색상이 달라도 눈에 같은 밝기로 보인다.
 * HSL의 L은 그 성질이 없어서 노랑과 파랑이 같은 값에서 전혀 다른 밝기로 나온다.
 *
 * 색각이상은 색만으로 못 푼다(2색각은 명도·청황 두 축만 본다). 여섯 범주를 색상으로
 * 가르는 것은 불가능하므로 `aria.decal` 패턴과 함께 쓰는 것을 전제한다.
 *
 * 7개 이상이 필요하면 계열을 늘리지 말고 묶어서 '기타'로 접는다.
 */

/** Lab → sRGB. 색역 밖이면 null */
function lch2rgb(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180)
  const b = C * Math.sin((h * Math.PI) / 180)
  const fy = (L + 16) / 116
  const [fx, fz] = [fy + a / 500, fy - b / 200]
  const inv = (t) => (t ** 3 > 0.008856 ? t ** 3 : (t - 16 / 116) / 7.787)
  const [X, Y, Z] = [inv(fx) * 0.95047, inv(fy), inv(fz) * 1.08883]
  const lin = [
    X * 3.2406 + Y * -1.5372 + Z * -0.4986,
    X * -0.9689 + Y * 1.8758 + Z * 0.0415,
    X * 0.0557 + Y * -0.204 + Z * 1.057,
  ]
  const out = []
  for (const v of lin) {
    if (v < -0.002 || v > 1.002) return null
    const c = Math.max(0, Math.min(1, v))
    out.push((c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055) * 255)
  }
  return out
}

/** 이 L*·색상각에서 색역에 들어가는 최대 채도 */
function maxChroma(L, h) {
  let lo = 0
  let hi = 132
  for (let i = 0; i < 26; i++) {
    const mid = (lo + hi) / 2
    lch2rgb(L, mid, h) ? (lo = mid) : (hi = mid)
  }
  return lo
}

/**
 * 색상각의 출처. Figma 기본 팔레트를 그대로 적고 각도는 **여기서 계산한다** —
 * 손으로 옮겨 적으면 어긋난다(실제로 파랑을 268로 적었는데 283이었다).
 * 파랑 · 주황 · 초록 · 보라 · 하늘 · 빨강.
 */
const CHART_REF = ['#2F80ED', '#F2994A', '#6FCF97', '#BB6BD9', '#56CCF2', '#EB5757']

/** sRGB → Lab 색상각 */
function hueOf(hex) {
  const [r, g, b] = hex2rgb(hex).map((v) => SRGB(v))
  let X = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  let Y = r * 0.2126 + g * 0.7152 + b * 0.0722
  let Z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  ;[X, Y, Z] = [f(X), f(Y), f(Z)]
  return ((Math.atan2(200 * (Y - Z), 500 * (X - Y)) * 180) / Math.PI + 360) % 360
}

const CHART_HUE = CHART_REF.map(hueOf)

/** 캔버스별 L* 사다리. 라이트는 3:1 때문에 58이 천장이라 아래로 벌린다 */
const CHART_L = {
  light: [46, 57, 52, 48, 56, 42],
  dark: [62, 74, 70, 60, 78, 64],
}

/** 채도 상한. 색역 끝까지 밀면 형광이 된다 — 참조가 C* 36~66이라 그 위를 넘지 않는다 */
const CHART_C_MAX = 66

export function chartPalette(scheme = 'light') {
  return CHART_HUE.map((hue, i) => {
    const L = CHART_L[scheme][i]
    return rgb2hex(lch2rgb(L, Math.min(maxChroma(L, hue) * 0.95, CHART_C_MAX), hue))
  })
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
