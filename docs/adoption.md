# 도입

두 가지 시나리오가 있다. **새 프로젝트 착수**(§1)가 이 자료의 목적이고,
**h-pms에 역이식**(§3)은 선택이다.

---

## 1. 새 프로젝트 착수

### 1-1. 설치

git 의존성으로 당긴다. 사내 npm registry가 없어도 되고, 태그를 찍어 버전을 고정한다.

```bash
npm i "git+https://github.com/HyundaiEzwel-AI-Dev-Lab/ez-design-system.git#v1.0.0"
```

`package.json`에는 이렇게 남는다.

```json
{ "dependencies": { "@ezwel/ui": "git+https://github.com/HyundaiEzwel-AI-Dev-Lab/ez-design-system.git#v1.0.0" } }
```

비공개 저장소라 인증이 필요하다. 로컬은 `gh auth login`의 credential helper가 처리하고,
CI에서는 SSH 쪽이 편하다 — `git+ssh://git@github.com/HyundaiEzwel-AI-Dev-Lab/ez-design-system.git#v1.0.0`.

**`#v1.0.0`을 반드시 붙인다.** 안 붙이면 기본 브랜치를 당기고, 설치 시점마다 다른 코드가
들어온다. 올릴 때는 태그만 바꾸고 `npm i`를 다시 돌린다.

설치 시 `prepare` 스크립트가 라이브러리를 빌드한다 — `dist/`를 저장소에 커밋하지 않기
때문이다. 그래서 첫 설치가 몇 초 더 걸린다.

### 1-2. 붙이기

CSS 한 줄, 토스트 호스트 한 줄이면 끝난다.

```ts
// main.ts
import '@ezwel/ui/all.css'
```

`all.css`는 토큰 → 리셋 → 컴포넌트 순으로 묶여 있다. 리셋을 프로젝트가 직접 관리하고 싶으면
쪼개서 가져간다.

```ts
import '@ezwel/ui/tokens.css'   // 변수만
import '@ezwel/ui/base.css'     // 리셋 + 포커스 링 + 접근성 유틸
import '@ezwel/ui/style.css'    // 컴포넌트 스타일
```

**순서가 바뀌면 안 된다** — 리셋과 컴포넌트가 토큰을 참조한다.

`App.vue` 루트에 토스트 호스트를 한 번 둔다.

```vue
<script setup lang="ts">
import { EzToastHost } from '@ezwel/ui'
</script>

<template>
  <RouterView />
  <EzToastHost />
</template>
```

### 1-3. 폰트

Pretendard woff2만 self-host한다. **사내 admin처럼 9종 13.7MB를 전부 로드하지 않는다** —
`--ez-font-weight`가 400/500/700 셋뿐이라 세 벌이면 된다.

```css
@font-face {
  font-family: 'Pretendard';
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/Pretendard-Regular.subset.woff2') format('woff2');
}
/* 500, 700도 같은 형태 */
```

`font-display: swap`이 없으면 폰트 로드 동안 글자가 안 보인다.

### 1-4. 브랜드색 교체

사내 표준(`#009782`)을 그대로 쓰면 할 일이 없다.

프로젝트 하나만 다른 색을 써야 하면 **소비 쪽에서 semantic 토큰을 덮는다** — 라이브러리를
포크하지 않는다.

```css
/* 프로젝트 전역 CSS, all.css 다음에 로드 */
:root {
  --ez-color-primary-40: #1a5fb4;
  --ez-color-primary-50: #16519b;
  /* 11단계 전부 */
}
```

**11단계를 다 바꾼다.** 한 단계만 바꾸면 대비 약속이 깨진다. 생성 스크립트는
[토큰 문서](/foundations) §5에 있다.

브랜드색이 사내 전체에서 바뀐 것이면 라이브러리 쪽 `src/styles/tokens.css`를 고치고
minor 버전을 올린다.

### 1-5. 리뷰 체크

PR에서 볼 것은 넷이다.

1. 화면 CSS에 `--ez-color-*`(primitive)가 있는가 → semantic 토큰을 만들어 쓴다.
2. hex·px 리터럴이 있는가 → 토큰화.
3. `outline: none`이 있는가 → 지운다.
4. 새 컴포넌트가 [컴포넌트](/components) §0 표에 없는 자리를 채우는가,
   아니면 있는 것과 겹치는가.

`grep -rn "#[0-9a-fA-F]\{6\}" src/ --include=*.vue` 한 줄이면 2번은 걸러진다.

---

## 2. 가져오지 않은 것

의도적으로 뺐다. 필요해지면 그때 만든다.

| 항목 | 이유 |
|---|---|
| 앱 셸(헤더·LNB·탭) | 프로젝트마다 정보구조가 다르다. h-pms 것을 베끼면 h-pms 메뉴 구조가 따라온다 |
| 날짜 피커 | `<input type="date">`로 시작하고, from~to 규칙이 확정되면 만든다 |
| 자동완성 | 검색 대상이 정해져야 debounce·취소·키보드 규칙이 정해진다 |
| 파일 업로드 | 허용 확장자·용량이 업무 규칙이다 |
| 차트 | 라이브러리 선정이 먼저다 |
| 확인 다이얼로그 | `EzModal` + 버튼 둘이면 되는데 래퍼를 미리 만들 이유가 없다 |
| 프리미엄 컨셉 | h-pms가 컨셉 3종을 유지하느라 토큰 세 벌을 관리한다. 라이트/다크 둘로 시작한다 |

---

## 3. h-pms 역이식 (선택)

**하지 않아도 된다.** 하려면 새 토큰을 **추가**하고 기존 것을 남긴다. 기존 토큰을 지우면
26개 화면이 함께 회귀한다(현행 `tokens.css` 주석이 경고하는 내용 그대로다).

### 3-1. 매핑

| h-pms | 대응 | 비고 |
|---|---|---|
| `--lnb-txt` `#2b2f36` | `--ez-text-strong` | |
| `--text-default` `#374151` | `--ez-text-default` | |
| `--text-muted` `#5b6472` | `--ez-text-muted` | |
| **`--lnb-muted`** `#9aa0a8` | `--ez-text-muted` | **2.64:1 → 4.48:1. 값이 바뀐다** |
| `--text-weak` `#8b93a1` | `--ez-text-muted` | 3.09:1 → 4.48:1 |
| `--teal` `#119a8a` | `--ez-color-primary-40` | 시각 차이 거의 없음 |
| `--teal-600` `#0e8275` | `--ez-action-primary` | |
| `--lnb-line` `#d7dbe0` | `--ez-border-default` | 사실상 같은 값 |
| `--st-*` 4종 | `--ez-status-*` | 대비 통과했던 계열 |
| `--blue`/`--green`/`--red`/`--orange`/`--purple`/`--gray` + `-bg` | `--ez-status-*` | **전부 AA 미달. 이건 값이 바뀌어야 한다** |
| `--radius-sm/md/lg/card` | `--ez-radius-sm/md/lg` | 14·18px은 12px로 내려온다 |
| `--space-*` | `--ez-space-*` | 이름만 다르고 값 동일 |

### 3-2. 순서

1. `tokens.css` 뒤에 `--ez-*`를 **추가**한다. 기존 토큰은 그대로 둔다.
2. 새 화면만 `--ez-*`를 쓴다.
3. 기존 화면은 만질 때 바꾼다. 한 번에 전환하지 않는다.
4. 구 상태 팔레트(`--blue`/`--green`/…)를 쓰는 화면은 **뱃지만** 먼저 바꾼다 — 대비 미달이
   실제 결함이고, 뱃지는 화면 로직과 무관해서 회귀 범위가 좁다.

`.app-*`/`.hp-*` 이중 클래스와 `admin.css`/`components.css` 이중 스킨은 이 작업으로 풀리지 않는다.
별건이고, 값 정본 합의가 선행이다.

### 3-3. 소유권

CLAUDE.md 소유권 지도상 `shared/styles`·`shared/ui`는 성찬민 영역이다. 박영민(횡단 시각 레이어)이
같이 만지는 자산이라 토큰 추가는 협업 보드에 올린다.

---

## 4. 검증

라이브러리 저장소에서 한 줄로 돈다.

```bash
npm run verify   # typecheck + test + build
```

현재 24개 테스트가 통과한다 — `useListPage`(경쟁 조회 방어), `usePagination`(페이지 당김),
`useEscapeToClose`(중첩 모달), `useFocusTrap`(Tab 순환·복귀), `EzPagination`(10개 묶음·`aria-current`).

`useFocusTrap`의 가시성 판정은 테스트를 붙이면서 바꿨다. 처음엔 `offsetParent !== null`이었는데
이 값은 **요소 자신이 `position: fixed`면 보이는데도 null**이고, jsdom에서는 항상 null이라
트랩이 아무것도 못 찾는다. 즉 검증 자체가 불가능한 판정식이었다. `checkVisibility()`로 바꿨고,
없는 환경(구형 브라우저·jsdom)에서는 거르지 않는다 — 걸러서 놓치는 쪽보다 안전하다.
