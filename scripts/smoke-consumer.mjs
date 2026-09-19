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

// step 40 앵커와 CTA가 step 50이라는 약속. 여기가 깨지면 대비 보장이 깨진 것이다
const tokens = readFileSync(require.resolve('@ezwel/ui/tokens.css'), 'utf8')
for (const t of ['--ez-color-primary-40: #009782', '--ez-action-primary: var(--ez-color-primary-50)']) {
  if (!tokens.includes(t)) throw new Error('토큰 누락: ' + t)
}

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
