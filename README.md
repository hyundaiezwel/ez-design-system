# EZ Design System

현대이지웰 업무 시스템 공용 디자인 시스템. 디자인 토큰과 Vue 3 컴포넌트를 한 패키지로 배포한다.

문서 사이트를 먼저 본다 — `npm run docs:dev` 후 http://localhost:5173

## 쓰는 쪽

```bash
npm i "git+https://github.com/HyundaiEzwel-AI-Dev-Lab/ez-design-system.git#v1.0.0"
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
npm은 `package.json`에 `github:HyundaiEzwel-AI-Dev-Lab/ez-design-system#v1.0.0` 축약형으로 적는다 — 같은 뜻이다.

비공개 저장소라 인증이 필요하다. 로컬은 `gh auth login`의 credential helper가 처리하고,
CI에서는 SSH가 편하다 — `git+ssh://git@github.com/HyundaiEzwel-AI-Dev-Lab/ez-design-system.git#v1.0.0`.

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

**토큰 값은 임의로 한 단계만 손보지 않는다.** step 번호가 흰 배경 대비비 약속이라
(40=3:1, 50=4.5:1, 70=7:1, 90=15:1) 한 칸만 바꾸면 약속이 깨진다. 계열 전체를 재생성한다 —
스크립트는 문서 사이트 「토큰」 §5에 있다.

`docs/public/styleguide.html`은 토큰 사본을 인라인으로 들고 있다. `src/styles/tokens.css`를
고치면 그 블록도 갈아끼운다.

버전은 semver로 끊는다. 토큰 값이 바뀌면 minor 이상, 컴포넌트 props가 깨지면 major다.
