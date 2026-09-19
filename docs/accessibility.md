# 접근성

목표는 **WCAG 2.1 AA**다. 여기 적힌 것은 전부 "나중에 고치면 비싼 것"이고, 대부분 토큰과
컴포넌트가 이미 처리한다. 사람이 챙겨야 할 것만 남겼다.

---

## 1. 토큰이 이미 해주는 것

| 요구 | 어떻게 |
|---|---|
| 본문 대비 4.5:1 | `--ez-text-*`가 전부 step 50 이상 |
| UI 요소 대비 3:1 | `--ez-border-strong`·`--ez-icon-*`이 step 40 이상 |
| 줄간격 150% | `--ez-line-height-normal` 기본값 |
| 확대 지원 | `data-font-scale` 5단계 |
| 고대비 모드 | `data-contrast="high"` — step을 한 단계 올린다 |
| 부분 다크 | `data-scheme="dark"` — 그 서브트리만 다크 의미 토큰. 셸만 어둡게 할 때 쓴다 |
| 모션 축소 | `prefers-reduced-motion`에서 duration 토큰이 0이 된다 |

**`--ez-color-*`(primitive)를 화면에서 직접 쓰면 이 보장이 깨진다.** semantic만 쓴다.

대비가 보장되지 않는 것: `--ez-text-disabled`(2.2:1)와 `--ez-border-default`(1.4:1).
전자는 비활성 요소라 WCAG 예외이고, 후자는 장식이다. **경계선만으로 정보를 전달하지 않는다.**

---

## 2. 색에만 기대지 않기 (WCAG 1.4.1)

색을 못 보는 사용자에게도 같은 정보가 가야 한다. 실무에서 걸리는 지점은 셋이다.

| 곳 | 색 외 단서 |
|---|---|
| 상태 뱃지 | 라벨 텍스트 (`EzBadge`는 항상 텍스트를 받는다). 더 필요하면 `dot` |
| 필수 항목 | `*` + 스크린리더용 "(필수)" 텍스트 (`EzField`가 넣는다) |
| 검증 오류 | 필드 하단 문구. 빨간 테두리만 두지 않는다 |
| 링크 | 밑줄 (`base.css`가 기본으로 넣는다 — 지우지 않는다) |
| 선택된 행 | 배경 + 좌측 막대 |
| 차트 | `--ez-chart-*` + 패턴(`aria.decal`) + 범례. 의미색(success/danger)을 범주에 쓰지 않는다 |

적록색약이 가장 흔하다. **success(초록)와 danger(빨강)를 나란히 두고 색으로만 구분하는 UI를
만들지 않는다.**

---

## 3. 키보드

마우스 없이 전 기능이 되어야 한다. 점검 순서:

1. **Tab만으로 주요 동작에 도달하는가.** `<div @click>`은 도달하지 않는다 — `<button>`을 쓴다.
2. **포커스가 보이는가.** `:focus-visible` 전역 규격이 그린다. `outline: none`을 쓰지 않는다.
3. **포커스 순서가 시각 순서와 같은가.** `position: absolute`로 자리를 옮긴 요소가 흔한 원인.
4. **모달에서 Tab이 뒤로 새지 않는가.** `useFocusTrap`이 막는다.
5. **모달을 닫으면 원래 자리로 돌아오는가.** `useFocusTrap`이 복귀시킨다.
6. **키보드 함정이 없는가.** 들어갔는데 Tab으로 못 나오는 위젯(날짜 피커 등).

단축키는 F2(조회)만 전역이다. 추가하려면 입력 중에도 눌리는지 먼저 확인한다.

### 본문 바로가기

헤더·LNB를 매번 Tab으로 지나가지 않도록 첫 요소에 둔다.

```html
<a href="#main" class="ez-skip-link">본문 바로가기</a>
...
<main id="main" tabindex="-1">…</main>
```

`base.css`의 `.ez-skip-link`가 포커스 받을 때만 나타난다.

---

## 4. 스크린리더

| 요소 | 필요한 것 |
|---|---|
| 아이콘 버튼 | `aria-label` |
| 장식 아이콘 | `aria-hidden="true"` |
| 입력 | `<label for>` — `EzField`가 처리 |
| 오류 | `aria-describedby` + `role="alert"` |
| 모달 | `role="dialog"` `aria-modal="true"` `aria-label` |
| 표 | `<th scope="col">`, 필요시 `<caption class="ez-sr-only">` |
| 접기 | `aria-expanded` + `aria-controls` |
| 페이저 | `<nav aria-label>` + 현재 `aria-current="page"` |
| 동적 갱신 | `aria-live="polite"` — 토스트·건수 |

`display: none`은 스크린리더도 못 읽는다. **화면에서만 숨기려면 `.ez-sr-only`를 쓴다.**

`aria-live="assertive"`는 쓰지 않는다 — 읽던 것을 끊어서 입력을 방해한다. 정말 끊어야 하는
것(세션 만료)은 모달로 띄운다.

---

## 5. 터치·포인터

| 요구 | 값 |
|---|---|
| 터치 목표 최소 | 24×24 CSS px (WCAG 2.5.8). `--ez-size-sm`(28)이 이미 넘는다 |
| 인접 목표 간격 | 목표가 24px 미만이면 주위 24px 안에 다른 목표가 없어야 한다 |
| 호버 전용 정보 | 금지. 툴팁 내용은 포커스로도 열려야 한다 |
| 드래그 전용 동작 | 금지. 버튼·키보드 대안을 둔다 |

표 행 안의 아이콘 버튼이 자주 걸린다 — 12px 아이콘을 그대로 쓰지 말고 28px 버튼으로 감싼다.

---

## 6. 점검

### 자동 (커밋 전)

```bash
npx @axe-core/cli http://localhost:5173/<경로>
```

axe는 자동 검출 가능한 것만 잡는다 — 실제 문제의 절반쯤이다. 라벨 누락·대비·ARIA 오용은 잡고,
포커스 순서·색 외 단서·의미 있는 대체 텍스트는 못 잡는다.

### 수동 (화면 완성 시)

1. 마우스를 치우고 Tab만으로 끝까지 조작.
2. 브라우저 200% 확대 — 가로 스크롤이 두 방향으로 나는지.
3. `data-contrast="high"`를 켜고 읽히는지.
4. macOS VoiceOver(`⌘F5`) 또는 NVDA로 폼 한 번 통과.

### 릴리스 전

- 목록 / 폼 / 팝업 각 대표 화면 1개씩 axe 통과.
- 키보드 전 경로 통과.
- 색각 시뮬레이터(Chrome DevTools > Rendering > Emulate vision deficiencies)로 적록색약 확인.

---

## 7. 자주 나는 실수

| 증상 | 원인 | 고치는 법 |
|---|---|---|
| Tab이 버튼을 건너뛴다 | `<div @click>` | `<button>` |
| 포커스가 안 보인다 | `outline: none` | 지운다. 전역 규격이 있다 |
| 모달 뒤로 포커스가 샌다 | 트랩 없음 | `useFocusTrap` |
| 스크린리더가 "버튼"만 읽는다 | 아이콘만 있는 버튼 | `aria-label` |
| 오류를 못 읽는다 | 문구가 입력과 연결 안 됨 | `EzField` 사용 |
| 확대하면 버튼이 사라진다 | 고정 폭 + `overflow: hidden` | `flex-wrap` |
| 뱃지가 안 읽힌다 | 색 블록만 있음 | 텍스트를 넣는다 |
