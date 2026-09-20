# EZ Design System

현대이지웰 업무 시스템 공용 디자인 시스템. 디자인 토큰과 Vue 3 컴포넌트를 한 패키지로 배포한다.

**문서 사이트: https://hyundaiezwel.github.io/ez-design-system/**
(스타일가이드: https://hyundaiezwel.github.io/ez-design-system/styleguide.html)

로컬에서 보려면 `npm run docs:dev`.

## 쓰는 쪽

```bash
npm i "git+https://github.com/hyundaiezwel/ez-design-system.git#v1.0.0"
```

```ts
// main.ts — 이 한 줄이 토큰 + 리셋 + 컴포넌트 스타일이다
import '@ezwel/ui/all.css'
```

```vue
<script setup lang="ts">
import { EzButton, EzTable, useListPage, notify } from '@ezwel/ui'
</script>
```

태그(`#v1.0.0`)를 반드시 붙인다. 안 붙이면 설치 시점마다 다른 코드가 들어온다.
npm은 `package.json`에 `github:hyundaiezwel/ez-design-system#v1.0.0` 축약형으로 적는다 — 같은 뜻이다.

비공개 저장소라 인증이 필요하다. 로컬은 `gh auth login`의 credential helper가 처리하고,
CI에서는 SSH가 편하다 — `git+ssh://git@github.com/hyundaiezwel/ez-design-system.git#v1.0.0`.

## 새 화면·새 컴포넌트를 만든다면

[설계 원칙](docs/principles.md)을 먼저 본다. 토큰 값은 이미 다 있는데 화면이 만족스럽지
않다면 그건 값 문제가 아니라 **값을 어디에 얼마나 쓸지 정하는 규칙**이 없어서다.

- §2 여백 — 크기가 아니라 역할로 고른다. 규칙 하나: **그룹 사이 ≥ 그룹 안 × 2**
- §3 배치 — 화면은 프리미티브 일곱 개로만 조립한다
- §8 새 화면 만드는 절차 (8단계)
- §9 새 컴포넌트 만드는 절차 (7단계)
- §10 리뷰에서 묻는 다섯 가지

## 만드는 쪽

```bash
npm install
npm run docs:dev      # 문서 사이트 (컴포넌트 데모가 src를 직접 본다)
npm run verify        # typecheck + test + build
```

| 스크립트 | 하는 일 |
|---|---|
| `build` | `dist/index.js` + `index.d.ts` + `style.css`, 그리고 `tokens.css`·`base.css`·`all.css` |
| `prepare` | 설치 시 자동 빌드 — `dist/`를 커밋하지 않으므로 git 의존성이 이걸로 동작한다 |
| `typecheck` | `vue-tsc --noEmit` |
| `test` | `vitest run` |
| `check:contrast` | 의미 토큰 조합 278쌍의 대비를 라이트·다크·고대비 전 조합에서 검사 |
| `palette` | `scripts/palette.mjs`로 primitive 색 값을 재생성 |
| `docs:build` | 문서 사이트 정적 빌드 (`docs/.vitepress/dist`) |
| `smoke` | 임시 디렉터리에 git 의존성으로 **실제 설치**해 배포 계약을 확인한다 — `prepare` 빌드, exports 맵, SSR 렌더. 태그를 찍기 전에 돌린다 |

## 구조

```
src/
  styles/tokens.css   토큰 정본 — primitive(값) / semantic(역할) 2층
  styles/base.css     리셋 + 포커스 링 + 접근성 유틸
  ui/                 컴포넌트 14종
  lib/                컴포저블 6종
docs/                 VitePress 문서 사이트
  public/styleguide.html   단일 파일 스타일가이드 (대비비 실시간 계산)
scripts/bundle-css.mjs     dist CSS 묶기
```

## 바꿀 때

**토큰 값은 임의로 한 단계만 손보지 않는다.** step 번호가 **캔버스 대비비** 약속이라
(40=3:1, 50=4.5:1, 70=7:1, 90=15:1) 한 칸만 바꾸면 약속이 깨진다.

```bash
npm run palette          # scripts/palette.mjs 로 램프 재생성
npm run check:contrast   # 의미 토큰 278쌍 재검증 (verify 에 물려 있다)
```

`docs/public/styleguide.html`은 토큰 사본을 인라인으로 들고 있다. `src/styles/tokens.css`를
고치면 그 블록도 갈아끼운다.

버전은 semver로 끊는다. 토큰 값이 바뀌면 minor 이상, 컴포넌트 props가 깨지면 major다.
