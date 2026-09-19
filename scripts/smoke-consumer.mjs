import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * 소비 설치 스모크 — 단위 테스트가 못 보는 **배포 계약**을 본다.
 *
 * git 의존성으로 실제 설치해서 확인하는 것 셋:
 *   1. `prepare` 훅이 dist를 만드는가 (dist를 커밋하지 않으므로 이게 유일한 빌드 경로다)
 *   2. exports 맵이 CSS 네 갈래를 내주는가
 *   3. SSR에서 컴포넌트가 죽지 않는가 (Nuxt·VitePress 소비 대비)
 *
 * 로컬 HEAD를 그대로 당긴다 — 커밋된 상태만 본다. 작업 트리 변경은 안 잡히므로
 * 커밋 후에 돌린다. 네트워크는 vue 설치에만 쓴다.
 *
 *   node scripts/smoke-consumer.mjs
 */
const repo = fileURLToPath(new URL('..', import.meta.url))
const dir = mkdtempSync(join(tmpdir(), 'ez-ui-smoke-'))
const run = (cmd, args) => execFileSync(cmd, args, { cwd: dir, stdio: 'pipe', encoding: 'utf8' })

console.log(`작업 디렉터리 ${dir}`)
writeFileSync(join(dir, 'package.json'), '{"name":"ez-ui-smoke","private":true,"type":"module"}\n')

console.log('설치 중 (prepare 훅이 라이브러리를 빌드한다)...')
run('npm', ['i', '--no-audit', '--no-fund', `git+file://${repo}#HEAD`, 'vue@^3.5'])

writeFileSync(
  join(dir, 'smoke.mjs'),
  `
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { EzButton, EzBadge, EzTable, EzModal, usePagination, ApiError, toMessageWithCode } from '@ezwel/ui'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
const require = createRequire(import.meta.url)

for (const sub of ['all.css', 'tokens.css', 'base.css', 'style.css']) {
  const bytes = readFileSync(require.resolve('@ezwel/ui/' + sub), 'utf8').length
  if (bytes === 0) throw new Error(sub + ' 가 비어 있다')
}

// **값이 아니라 계약을 본다.** 처음엔 브랜드 원색 hex를 단언했는데 v1.1.0에서 그 값이
// 스케일에서 빠지자 스모크가 깨졌다 — 값은 재생성으로 바뀌는 게 정상이고,
// 바뀌면 안 되는 것은 구조다. 대비 자체는 check-contrast가 본다.
const tokens = readFileSync(require.resolve('@ezwel/ui/tokens.css'), 'utf8')
const CONTRACT = [
  '--ez-action-primary: var(--ez-color-primary-50)', // CTA는 본문 대비 등급을 쓴다
  '--ez-text-muted: var(--ez-color-gray-50)',        // 보조 텍스트 하한
  '--ez-brand:',                                      // 브랜드 원색은 스케일 밖에 따로 있다
  "--ez-surface-canvas",                              // 대비 기준면
]
for (const t of CONTRACT) {
  if (!tokens.includes(t)) throw new Error('토큰 계약 누락: ' + t)
}
// 램프가 온전한가 — 계열 6종 × 11단.
// 정규식을 안 쓴다: 이 문자열은 템플릿 리터럴 안에 들어가 파일로 쓰이는데,
// 그때 \d 같은 이스케이프가 한 겹 벗겨져 패턴이 조용히 망가진다(실제로 0건이 나왔다).
const steps = tokens.split('--ez-color-').length - 1
if (steps < 66) throw new Error('색 단계 부족: ' + steps)

const App = {
  setup: () => () => [
    h(EzButton, { variant: 'primary' }, () => '저장'),
    h(EzBadge, { tone: 'success' }, () => '완료'),
    h(EzTable, {
      columns: [{ key: 'id', label: 'ID' }, { key: 'rate', label: '진척률', type: 'number' }],
      rows: [{ id: 'REQ-1', rate: '62%' }],
      rowKey: (r) => r.id,
    }),
    h(EzModal, { open: true, title: '삭제', onClose: () => {} }, () => '본문'),
  ],
}
const html = await renderToString(createSSRApp(App))
for (const frag of ['ez-btn--primary', 'ez-badge--success', 'text-align:right', 'REQ-1']) {
  if (!html.includes(frag)) throw new Error('SSR 출력 누락: ' + frag)
}

const { ref } = await import('vue')
const { totalPages, paged } = usePagination(ref([1, 2, 3, 4, 5]), 2)
if (totalPages.value !== 3 || paged.value.length !== 2) throw new Error('usePagination 오작동')
if (toMessageWithCode(new ApiError('E_LOCK', '편집 중입니다')) !== 'E_LOCK: 편집 중입니다') {
  throw new Error('toMessageWithCode 오작동')
}
console.log('OK — dist 빌드 · exports · SSR · 컴포저블')
`,
)

process.stdout.write(run('node', ['smoke.mjs']))
console.log('소비 설치 스모크 통과')
