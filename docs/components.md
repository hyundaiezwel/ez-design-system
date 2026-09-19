<script setup>
import { ref } from 'vue'
import { notify } from '@ezwel/ui'

const modalOpen = ref(false)
const panelOpen = ref(false)
const page = ref(23)
const name = ref('차기 통합 포털 구축')
const jira = ref('PMS-0')
const rows = [
  { id: 'REQ-0142', title: '프로젝트 등록 시 JIRA 번호 중복 검증', status: '완료', tone: 'success', rate: '100%' },
  { id: 'REQ-0143', title: 'WBS 일정 변경 이력 조회', status: '진행', tone: 'info', rate: '62%' },
  { id: 'REQ-0144', title: 'DEV 테스트 케이스 자동 생성', status: '검토', tone: 'warning', rate: '40%' },
  { id: 'REQ-0145', title: '결함 조치확인 반려 사유 필수화', status: '지연', tone: 'danger', rate: '8%' },
]
const columns = [
  { key: 'id', label: '요구사항 ID' },
  { key: 'title', label: '요구사항명' },
  { key: 'status', label: '상태', type: 'status' },
  { key: 'rate', label: '진척률', type: 'number' },
]
</script>

# 컴포넌트

구현은 `src/ui/`에 있다. 이 문서는 **분류·규칙·API 요약**이다.

---

## 0. 분류 — 새로 만들기 전에 여기부터 본다

KRDS의 10범주를 쓴다. h-pms `shared/ui`는 평면 나열이라 "비슷한 게 이미 있나"를 찾기 어려웠고,
그래서 같은 일을 하는 컴포넌트가 이름만 다르게 여러 벌 생겼다.

| 범주 | 제공 | 미제공 (필요해지면 여기에) |
|---|---|---|
| 액션 | `EzButton` | 분할 버튼, FAB |
| 입력 | `EzField` `EzInput` `EzSelect` `EzCheckbox` | 날짜, 파일 업로드, textarea, 자동완성 |
| 선택 | `EzCheckbox`(radio 겸용) | 토글, 세그먼트 |
| 표현 | `EzTable` `EzBadge` | 카드, KPI, 차트 |
| 탐색 | `EzPagination` | 탭, 브레드크럼, LNB, 트리 |
| 피드백 | `EzToastHost` `EzLoadingOverlay` `EzEmptyState` | 확인 다이얼로그, 인라인 알림 |
| 레이아웃 | `EzModal` `EzSlidePanel` | 앱 셸, 아코디언 |
| 도움 | — | 툴팁, 도움말 팝오버 |
| 아이덴티티 | — | 로고, 헤더, 푸터 |
| 콘텐츠 | — | 빈 문서, 미리보기 |

**미제공 칸은 의도적이다.** 차기 프로젝트의 실제 화면을 보기 전에 만들면 쓰이지 않거나
두 번째 화면에서 뜯게 된다. 두 화면 이상에서 같은 모양이 나오면 그때 만든다.

---

## 1. 공통 규칙

### 만들기 전에

1. 위 표에 이미 있나 — 있으면 쓴다.
2. 네이티브 요소로 되나 — `<select>`·`<details>`·`<dialog>`·`<input type="date">`는
   키보드·IME·스크린리더·모바일 동작을 이미 갖고 있다. 커스텀으로 다시 만들면 그걸 전부 다시 짠다.
3. 두 화면 이상에서 쓰이나 — 한 화면짜리면 그 화면 안에 둔다.

### props 규칙

- **불리언은 긍정형.** `disabled`(○) `notDisabled`(✕).
- **variant/tone/size는 문자열 유니온.** 불리언 플래그 조합(`primary` + `large`)으로 만들지 않는다 —
  `primary danger` 같은 불가능한 조합이 타입으로 표현돼 버린다.
- **색을 props로 받지 않는다.** `tone="danger"`는 받아도 `color="#f00"`은 받지 않는다.
- **업무 상태값을 컴포넌트가 알지 않는다.** 상태 → tone 매핑은 공통코드에서 내려받는다
  ([패턴](/patterns) §4).

### 접근성 최소선

| | 요구 |
|---|---|
| 아이콘만 있는 컨트롤 | `aria-label` 필수 |
| 입력 | `<label for>` 연결. `EzField`가 처리한다 |
| 오류 | `aria-describedby` + `role="alert"`. 색만으로 표시하지 않는다 |
| 모달·dim 패널 | `role="dialog"` + `aria-modal` + 포커스 트랩 + Esc |
| 표 | `<th scope="col">`, 용도 설명이 필요하면 `<caption class="ez-sr-only">` |
| 접기/펼치기 | `aria-expanded` + `aria-controls` |
| 포커스 | `outline: none`으로 지우지 않는다. 전역 `:focus-visible` 규격을 쓴다 |

---

## 2. API 요약

전체 props는 각 `.vue` 파일 상단 주석에 있다. 여기는 **판단이 필요한 것만** 적는다.

### EzButton

`variant`: `primary` | `secondary`(기본) | `ghost` | `danger` · `size`: `sm`/`md`/`lg`

- **한 화면에 `primary`는 하나.** 둘이면 사용자가 주 동작을 못 고른다.
- `loading`은 자동으로 비활성이다. 저장 중복 클릭 방지를 호출부가 또 걸 필요 없다.
- `iconOnly`면 `aria-label`을 반드시 넘긴다.

<div class="ez-demo">
  <EzButton variant="primary">저장</EzButton>
  <EzButton>취소</EzButton>
  <EzButton variant="ghost">더 보기</EzButton>
  <EzButton variant="danger">삭제</EzButton>
  <EzButton disabled>비활성</EzButton>
  <EzButton variant="primary" loading>저장 중</EzButton>
  <EzButton size="sm">sm 28</EzButton>
  <EzButton size="lg">lg 40</EzButton>
</div>

### EzField + 컨트롤

겉틀(라벨·필수·도움말·오류)과 컨트롤을 나눴다. 합치면 셀렉트·날짜·업로드마다 겉틀이 복제된다.

```vue
<EzField label="프로젝트명" required :error="errors.name" help="최대 50자">
  <template #default="{ id, describedBy, invalid }">
    <EzInput :id="id" v-model="form.name" :described-by="describedBy" :invalid="invalid" />
  </template>
</EzField>
```

슬롯 props 3개를 컨트롤에 그대로 넘기는 것이 이 컴포넌트를 쓰는 이유다 — 라벨 연결과
오류 안내가 스크린리더까지 도달한다.

`readonly`와 `disabled`를 구분한다. **상태에 따라 못 고치는 필드는 `readonly`다** —
값이 의미 있고, 포커스·복사가 되고, 폼 전송에 포함된다. `disabled`는 값 자체가 무의미할 때만.

<div class="ez-demo ez-demo--top">
  <EzField label="프로젝트명" required help="최대 50자">
    <template #default="{ id, describedBy, invalid }">
      <EzInput :id="id" v-model="name" :described-by="describedBy" :invalid="invalid" />
    </template>
  </EzField>

  <EzField label="JIRA 번호" required error="이미 등록된 번호입니다">
    <template #default="{ id, describedBy, invalid }">
      <EzInput :id="id" v-model="jira" :described-by="describedBy" :invalid="invalid" />
    </template>
  </EzField>

  <EzField label="요청부서" help="JIRA 연계 · 수정 불가">
    <template #default="{ id, describedBy }">
      <EzInput :id="id" model-value="디지털플랫폼실" :described-by="describedBy" readonly />
    </template>
  </EzField>

  <EzCheckbox label="종료일 없음" :model-value="true" />
</div>

### EzBadge

`tone` 6종. fg/bg/bd 3종 토큰을 한 덩어리로 가져온다 — 하나만 떼어 쓰면 대비가 깨진다.
`dot`을 켜면 색 외 단서가 하나 붙는다(색각이상 대응).

<div class="ez-demo">
  <EzBadge>대기</EzBadge>
  <EzBadge tone="brand">확정</EzBadge>
  <EzBadge tone="info" dot>진행</EzBadge>
  <EzBadge tone="success">완료</EzBadge>
  <EzBadge tone="warning">검토</EzBadge>
  <EzBadge tone="danger">지연</EzBadge>
</div>

### EzTable

컬럼 정의 + `cell:<key>` 슬롯. 정렬 축은 `type`이 정한다 — `text` 좌 / `number` 우 / `status` 중앙.

```vue
<EzTable :columns="cols" :rows="paged" :row-key="(r) => r.id" caption="요구사항 목록">
  <template #cell:status="{ value }">
    <EzBadge :tone="toneOf(value)">{{ labelOf(value) }}</EzBadge>
  </template>
</EzTable>
```

`rowKey`를 안 주면 인덱스를 쓰는데, 정렬·삭제 시 Vue가 행을 잘못 재사용한다. **항상 준다.**

<div class="ez-demo ez-demo--stack">
  <EzTable :columns="columns" :rows="rows" :row-key="(r) => r.id" selected-key="REQ-0143" caption="요구사항 목록 예시">
    <template #cell:status="{ row }">
      <EzBadge :tone="row.tone">{{ row.status }}</EzBadge>
    </template>
  </EzTable>
  <EzPagination v-model:page="page" :total-pages="47" mode="numbers" />
</div>

### EzModal / EzSlidePanel

| | EzModal | EzSlidePanel |
|---|---|---|
| 쓰는 때 | 흐름을 끊어야 할 때 | 뒤 목록 맥락을 유지할 때 |
| dim | 항상 | `dim` prop |
| 포커스 트랩 | 항상 | `dim`일 때만 |
| Esc | 항상 | `dim`일 때만 |

**배경 클릭으로 닫히지 않는다.** 입력 중 오클릭으로 작성분이 날아가기 때문이다
(h-pms에서 실제로 겪고 뺀 동작). 닫는 길은 Esc와 닫기 버튼 둘뿐이다.

dim 없는 패널에 포커스를 가두지 않는 이유 — 뒤 화면을 조작할 수 있어야 하는데 포커스가
갇히면 키보드 사용자만 못 한다. **반쯤 모달인 상태가 접근성에서 제일 나쁘다.**

<div class="ez-demo">
  <EzButton @click="modalOpen = true">레이어 팝업 열기</EzButton>
  <EzButton @click="panelOpen = true">사이드 패널 열기</EzButton>

  <EzModal :open="modalOpen" title="요구사항 삭제" size="md" @close="modalOpen = false">
    <p>요구사항 3건을 삭제합니다. 되돌릴 수 없습니다.</p>
    <template #footer>
      <EzButton @click="modalOpen = false">취소</EzButton>
      <EzButton variant="danger" @click="modalOpen = false">삭제</EzButton>
    </template>
  </EzModal>

  <EzSlidePanel :open="panelOpen" title="REQ-0143 상세" dim @close="panelOpen = false">
    <EzField label="요구사항명">
      <template #default="{ id }">
        <EzInput :id="id" model-value="WBS 일정 변경 이력 조회" />
      </template>
    </EzField>
    <template #footer>
      <EzButton @click="panelOpen = false">닫기</EzButton>
      <EzButton variant="primary" @click="panelOpen = false">저장</EzButton>
    </template>
  </EzSlidePanel>
</div>

### EzSearchBar

`<form>`으로 감쌌다. Enter 조회를 직접 구현하지 않기 위해서다 — 브라우저 기본 동작이 이미 한다.
F2만 따로 듣는다(현업 관행).

상세검색 영역은 `v-show`로 접는다(`v-if` 아님). **접어도 조건 값이 살아 있어야 한다.**

### EzLoadingOverlay

`delay`(기본 1000ms) 안에 끝나면 아예 안 뜬다. 순식간에 떴다 사라지는 오버레이가 깜빡임으로
읽히기 때문이다. 호출부는 `show`만 토글한다.

### EzToastHost / `notify()`

앱 루트에 한 번 둔다. 노출 시간이 tone별로 다르다(info·success 3초 / warning 5초 / danger 6초).

`aria-live="polite"`다. 오류도 polite인 이유 — assertive는 입력 중 낭독을 끊어 폼 작성을 방해한다.
정말 끊어야 하는 것(세션 만료 등)은 토스트가 아니라 모달이다.

<div class="ez-demo">
  <EzButton @click="notify('저장했습니다', 'success')">success</EzButton>
  <EzButton @click="notify('중복 3건은 등록하지 않았습니다', 'warning')">warning</EzButton>
  <EzButton @click="notify('REQUIREMENT_LOCKED: 다른 사용자가 편집 중입니다', 'danger')">danger</EzButton>
  <EzToastHost />
</div>

---

### EzEmptyState

"조회 결과 없음"과 "아직 등록한 것이 없음"은 다른 화면이다 — 전자는 조건을 바꾸라고,
후자는 만들라고 안내해야 한다. `variant`로 가른다.

<div class="ez-demo ez-demo--stack">
  <EzEmptyState />
  <EzEmptyState variant="empty" description="첫 프로젝트를 등록해 보세요">
    <template #action><EzButton variant="primary">프로젝트 등록</EzButton></template>
  </EzEmptyState>
</div>

## 3. 컴포저블

| | 하는 일 |
|---|---|
| `useListPage(loader, opts?)` | 목록 조회의 `rows`/`loading`/`error` + try/catch. **예외를 다시 던지지 않는다** |
| `usePagination(source, size?)` | 클라이언트 페이징. 목록이 줄면 현재 페이지를 당긴다 |
| `useFocusTrap(el, isOpen)` | 모달 안에 Tab 가두기 + 닫을 때 원래 자리로 복귀 |
| `useEscapeToClose(isOpen, close)` | 겹친 모달 중 **가장 위 하나만** Esc에 반응 |
| `toMessage` / `toMessageWithCode` | 오류 → 사용자 문구. 코드 접두는 운영자 화면에서만 |
| `notify(message, tone)` | 토스트 발행 |

`useListPage`는 **조회를 자동 시작하지 않는다.** 화면마다 조회 전 가드(프로젝트 선택 여부 등)가
달라서다. `onMounted(reload)`든 필터 확정 시점이든 직접 부른다.

`useListPage`에는 경쟁 조회 방어가 들어 있다 — 앞선 요청이 늦게 도착해 최신 결과를 덮는 것을 막는다.
h-pms에서 실제로 목록이 되돌아가는 결함이 있었다.
