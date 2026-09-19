import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

/**
 * 라이브러리 빌드. 문서 사이트는 VitePress가 따로 돌린다(`npm run docs:dev`).
 *
 * CSS를 한 파일(`style.css`)로 뽑는 이유 — 컴포넌트를 하나만 import 해도 스타일이 갈라지지
 * 않게 한다. 토큰·리셋은 원본 그대로 dist에 복사하고(`scripts/bundle-css.mjs`), 셋을 묶은
 * `all.css`도 같이 만든다.
 */
export default defineConfig({
  plugins: [
    vue(),
    dts({ include: ['src'], exclude: ['src/**/*.spec.ts'] }),
  ],
  build: {
    lib: {
      entry: fileURLToPath(new URL('src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    // vue는 소비 프로젝트의 것을 쓴다. 번들에 넣으면 인스턴스가 둘이 된다
    rollupOptions: {
      external: ['vue'],
      output: { assetFileNames: 'style.css' },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
  },
})
