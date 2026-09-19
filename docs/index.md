---
layout: home

hero:
  name: EZ Design System
  text: 업무 시스템 공용 UI 토대
  tagline: 대비비가 토큰 번호에 박혀 있는 디자인 시스템. 색을 고르는 대신 역할을 고른다.
  actions:
    - theme: brand
      text: 토큰부터 보기
      link: /foundations
    - theme: alt
      text: 컴포넌트
      link: /components
    - theme: alt
      text: 스타일가이드 열기
      link: /styleguide.html
      target: _blank

features:
  - title: step 번호 = 대비비
    details: 40이 3:1, 50이 4.5:1, 70이 7:1, 90이 15:1. "이 회색 써도 되나"라는 질문이 사라진다.
  - title: 테마가 공짜로 따라온다
    details: 다크는 step 뒤집기, 선명한 화면 모드는 step 한 칸 올리기. 팔레트가 세 벌로 늘지 않는다.
  - title: 실전에서 나온 규칙
    details: 로딩 1초 · 엑셀 전건 검증 · 자동완성 debounce · 경쟁 조회 방어. h-pms 운영 코드에서 승계했다.
---

## 무엇인가

현대이지웰 업무 시스템이 화면을 그리기 전에 정해둬야 할 것들. 세 소스를 재서 골라 담았다 —
**h-pms 운영 코드**(실전 동작 규칙), **사내 관리자센터 WebSquare UI**(사내 정합성 기준),
**범정부 KRDS**(체계의 교과서).

패키지 하나에 토큰과 Vue 3 컴포넌트가 함께 들어 있다.

```bash
npm i "git+https://github.com/hyundaiezwel/ez-design-system.git#v1.0.0"
```

```ts
// main.ts
import '@ezwel/ui/all.css'
```

```vue
<script setup lang="ts">
import { EzButton, EzTable, useListPage } from '@ezwel/ui'
</script>
```

자세한 절차는 [도입](/adoption).

## 세 줄 요약

1. **토큰을 2층으로 나눈다.** primitive(값)와 semantic(역할). 화면은 semantic만 쓴다.
   h-pms가 1층이라 같은 역할에 이름이 네 벌 생겼고, 지금은 값을 바꿀 수 없는 상태다.
2. **색 step 번호가 대비비 약속이다.** 값은 HSL 이분탐색으로 목표 상대휘도를 맞춰 생성했고
   WCAG 공식으로 재검증했다 — 눈으로 고른 값이 아니다.
3. **동작 규칙은 h-pms에서 승계한다.** 문서가 아니라 운영 중인 화면에서 나온 규칙이다.

## 실측으로 드러난 것

| 발견 | 수치 |
|---|---|
| h-pms·사내 admin 기본 CTA 버튼의 흰 글자가 WCAG AA 미달 | 3.49:1 / 3.65:1 (필요 4.5) |
| h-pms `--lnb-muted` — 가장 널리 쓰이는 보조 텍스트 색이 미달 | 2.64:1 |
| h-pms 구 상태 뱃지 6종 전부 미달 | 2.07 ~ 3.78:1 |
| h-pms 신 `--st-*` 4종은 전부 통과 | 4.73 ~ 6.48:1 |
| 두 브랜드색(`#009782` / `#119a8a`)의 hue 차 | 1.3° — 사실상 같은 색 |

계산 방법과 결정 근거는 [3개 소스 비교 분석](/comparison).

## 정하지 않는 것

- **앱 셸**(헤더·LNB·탭) — 프로젝트마다 정보구조가 다르다.
- **도메인 컴포넌트** — 업무 규칙이 붙은 것은 화면 소유자가 만든다.
- **KRDS 준수** — 참고로만 반영했다. 대국민 접점이 생기면 본문 17px·Pretendard GOV까지
  따라가야 하고 결정이 뒤집힌다.
