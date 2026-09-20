import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

/**
 * 문서 안 `#앵커` 링크가 실제 제목을 가리키는지 본다.
 *
 * VitePress의 슬러그가 한글 제목을 **NFD(자모 분해)**로 내보낸다. 소스 마크다운은
 * NFC라 육안으로는 같아 보이는데 브라우저는 fragment를 정규화하지 않아서, 손으로 쓴
 * `#한글-제목` 링크가 조용히 죽는다 — 빌드는 통과하고 클릭해야 안 움직이는 걸 안다.
 * 실제로 두 건이 그렇게 살아 있었다(2026-09-20).
 *
 * 슬러그 생성을 고치는 쪽은 시도했다 실패했다 — 기본 slugify가 구두점·번호까지
 * 처리하고 있어서 갈아끼우면 앵커 114개가 한꺼번에 깨진다. 그래서 **생성은 그대로 두고
 * 결과를 검사한다**. 비교는 NFC로 정규화해서 한다.
 */
const dist = fileURLToPath(new URL('../docs/.vitepress/dist', import.meta.url))
const nfc = (s) => s.normalize('NFC')

let dead = 0
for (const file of readdirSync(dist).filter((f) => f.endsWith('.html'))) {
  const html = readFileSync(join(dist, file), 'utf8')
  const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => nfc(m[1])))
  const bad = [...new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => nfc(m[1])))]
    .filter((a) => a && !ids.has(a))
  if (bad.length) {
    dead += bad.length
    console.log(`  ${file}`)
    bad.forEach((a) => console.log(`    #${a}`))
  }
}

if (dead) {
  console.log(`\n앵커 검사: 죽은 링크 ${dead}건`)
  process.exit(1)
}
console.log('앵커 검사: 죽은 링크 없음')
