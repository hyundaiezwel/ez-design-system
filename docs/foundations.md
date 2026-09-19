# 기초 — 토큰 체계

정본은 `src/styles/tokens.css`다. 이 문서는 **왜 그렇게 생겼는지**와
**어떻게 쓰는지**만 적는다. 값이 궁금하면 파일을 본다.

---

## 1. 두 층, 한 방향

```
primitive   --ez-color-gray-50        값 그 자체
    ↓  참조
semantic    --ez-text-muted           역할 이름
    ↓  참조
화면 CSS    color: var(--ez-text-muted)
```

**화면은 semantic만 쓴다.** primitive를 화면에서 참조하는 순간 "이 회색이 어떤 역할이었는지"가
사라지고, 나중에 값을 바꿀 때 무엇이 도는지 알 수 없게 된다. h-pms가 정확히 그 상태다
([비교 분석](/comparison) §2).

리뷰에서 걸러야 할 것은 딱 두 가지다.

- 화면 CSS에 `--ez-color-*`가 보이면 → semantic 토큰이 없다는 뜻. 토큰을 추가하고 그걸 쓴다.
- 화면 CSS에 hex·px 리터럴이 보이면 → 토큰화 대상.

---

## 2. step 번호는 대비비 약속이다

색 스케일의 번호는 순서가 아니라 **흰 배경에서의 대비비**다.

| step | 대비 | 쓸 수 있는 곳 |
|---|---|---|
| 5 / 10 | 1.07 / 1.15 | 면 배경 |
| 20 / 30 | 1.40 / 1.98 | 경계선(장식), 비활성 면 |
| **40** | **3:1** | 큰 글씨(19px+ 또는 15px bold), 아이콘, UI 경계선 |
| **50** | **4.5:1** | **본문 글씨 하한** |
| 60 | 5.7 | 본문 강조 |
| **70** | **7:1** | AAA · 선명한 화면 모드 본문 |
| 80 | 10 | 제목 |
| **90** | **15:1** | 최대 강조 |
| 95 | 18 | 다크 테마 캔버스 |

값은 HSL 이분탐색으로 목표 상대휘도를 맞춰 생성했고 WCAG 공식으로 재검증했다.
**눈으로 고른 값이 아니다 — 한 단계만 임의로 손보면 약속이 깨진다.**

다크 테마는 같은 약속을 뒤집는다. surface(`gray-90`) 위에서 step 20은 10.7:1, step 30은 7.6:1,
step 40은 5.0:1이다. 그래서 라이트가 80/50을 쓰는 자리에 다크는 20/40을 쓴다.

### 이게 주는 것

1. **"이 색 써도 되나"가 사라진다.** 본문이면 50 이상, 아이콘이면 40 이상.
2. **선명한 화면 모드가 공짜다.** 팔레트를 새로 만들지 않고 step만 올린다
   (`--ez-text-muted`: 50 → 70).
3. **다크 테마가 대칭이다.** 값을 새로 고르지 않고 step만 뒤집는다.

---

## 3. 색 계열

| 계열 | 용도 | 앵커 |
|---|---|---|
| `gray` | 면·글자·경계. hue 215를 섞은 blue-gray | — |
| `primary` | 브랜드·주요 액션 | step 40 = `#009782` (사내 admin 표준 주색) |
| `secondary` | 보조 액션·링크·정보 | — |
| `success` / `warning` / `danger` | 상태 | — |

브랜드색을 바꿔야 하면 `primary` 11단계를 다시 생성한다. 한 단계만 바꾸지 않는다.
생성 방법은 [`scripts/`](#5-스케일-재생성) 참조.

### 액션 색에 걸린 제약

`primary-40`(`#009782`) 위의 흰 글자는 3.65:1로 **본문 대비 미달**이다. 그래서
`--ez-action-primary`는 step 40이 아니라 **step 50**(`#038674`, 4.50:1)을 가리킨다.
브랜드색 자체는 `--ez-color-primary-40`으로 남아 있고 로고·큰 면적·장식에 쓴다.

다크 테마에서는 반대다. 어두운 면에 어두운 버튼을 올릴 수 없으므로 `--ez-action-primary`가
step 30(밝은 쪽)을 가리키고 글자를 어둡게 뒤집는다(`--ez-action-primary-on: gray-95`).

---

## 4. 색 아닌 토큰

### 간격 — 4px 배수만

`--ez-space-1`(4px) … `--ez-space-12`(48px). 홀수 값이 필요하면 그 레이아웃이 틀린 것이다.

### 크기 — 3종 고정

`--ez-size-sm`(28) / `md`(34) / `lg`(40). 입력·버튼·페이저 버튼이 전부 이 셋 안에서 논다.
줄에 놓인 컨트롤 높이가 서로 다르면 눈이 먼저 알아챈다.

### radius — 3단계

`sm`(4) 뱃지·체크박스 · `md`(8) 입력·버튼 · `lg`(12) 카드·패널·모달.
h-pms는 6/8/10/14/18px 다섯 단계였고 어느 것이 카드인지 규칙이 없었다.

### 글자 — 6단계 + offset

| 토큰 | 기본 | 쓰는 곳 |
|---|---|---|
| `2xs` | 11px | 뱃지, 메타, 힌트 |
| `xs` | 12px | 표, 조회 조건, 보조 |
| `sm` | 13px | **본문** |
| `md` | 14px | 섹션 제목, 모달 타이틀 |
| `lg` | 16px | 카드 제목 |
| `xl` / `2xl` | 20 / 24px | 페이지 타이틀, KPI |

전 단계가 `calc(Npx + var(--ez-font-size-offset))`이라 `data-font-scale`만 바꾸면 따라온다.

굵기는 **400 / 500 / 700 세 종뿐**이다. 500은 UI 라벨(버튼·탭·표 헤더)에만 쓴다.
본문 강조는 700이다. 600·800을 쓰지 않는 이유는 h-pms에서 같은 13px에 500/600/700이 섞여
강조 위계가 읽히지 않았기 때문이다.

줄간격 하한은 150%(`--ez-line-height-normal`)다. `tight`(1.3)는 뱃지·표 셀처럼 한 줄로 끝나는
요소에만 쓴다.

### z-index — 다섯 층

`sticky`(100) < `dropdown`(200) < `panel`(300) < `modal`(400) < `toast`(500).
컴포넌트에서 숫자를 직접 쓰지 않는다. 새 층이 필요하면 여기에 이름을 만든다.

### 모션

`fast`(120ms) 색·테두리 / `normal`(200ms) 패널·모달 / `slow`(320ms) 큰 전환.
`prefers-reduced-motion`에서 전부 0.01ms로 덮이므로 **컴포넌트마다 미디어쿼리를 쓰지 않는다.**
회전 스피너처럼 "멈추면 안 되는" 모션은 컴포넌트가 개별로 대체 표현을 둔다(`EzButton` 참고).

---

## 5. 스케일 재생성

브랜드색이 바뀌거나 계열을 추가할 때 쓴다. hue와 saturation을 주면 목표 대비를 맞춘 11단계가 나온다.

```python
import colorsys

def lin(c):
    c = c / 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def luminance(rgb):
    r, g, b = (lin(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def solve(hue, sat, target_y):
    """상대휘도가 target_y가 되는 명도를 이분탐색으로 찾는다"""
    lo, hi = 0.0, 1.0
    for _ in range(60):
        mid = (lo + hi) / 2
        rgb = [c * 255 for c in colorsys.hls_to_rgb(hue / 360, mid, sat)]
        lo, hi = (mid, hi) if luminance(rgb) < target_y else (lo, mid)
    rgb = [c * 255 for c in colorsys.hls_to_rgb(hue / 360, (lo + hi) / 2, sat)]
    return '#%02x%02x%02x' % tuple(round(c) for c in rgb)

# step: 목표 상대휘도. 40/50/70/90이 각각 3 / 4.5 / 7 / 15:1을 만든다
Y = {5: .93, 10: .86, 20: .70, 30: .48, 40: .30, 50: .18333,
     60: .135, 70: .10, 80: .055, 90: .02, 95: .008}
# 밝은 단계는 채도를 낮춘다 — 안 낮추면 형광색이 된다
TAPER = {5: .45, 10: .55, 20: .70, 30: .85, 40: 1, 50: 1,
         60: .95, 70: .90, 80: .85, 90: .80, 95: .75}

for step, y in Y.items():
    print(step, solve(171.7, 0.95 * TAPER[step], y))
```

대비 공식 검산은 `(밝은 휘도 + 0.05) / (어두운 휘도 + 0.05)`다.

---

## 6. 테마 스위치

| 속성 | 값 | 효과 |
|---|---|---|
| `data-theme` | `dark` | semantic 재매핑 |
| `data-contrast` | `high` | step 한 단계 진하게 (라이트·다크 양쪽에 겹쳐 적용) |
| `data-font-scale` | `2`~`5` | 단계당 +1px |

셋은 독립이다. `<html data-theme="dark" data-contrast="high" data-font-scale="3">`이 성립한다.

```ts
// 사용자 설정 적용 — 앱 부트스트랩 한 곳에서만 만진다
const root = document.documentElement
root.dataset.theme = prefs.theme            // 'light' | 'dark'
root.dataset.contrast = prefs.highContrast ? 'high' : ''
root.dataset.fontScale = String(prefs.fontScale)  // '1'~'5'
```

`data-theme`을 `light`로 두면 기본값이라 아무 규칙도 안 걸린다 — 지우지 않아도 된다.
