import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

const source = readFileSync(new URL('../lib/menu-image.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
const context = { exports: {} }
runInNewContext(compiled, context)
const { menuImageExtension, MAX_MENU_IMAGE_BYTES } = context.exports

test('recognizes supported image signatures with matching MIME types', () => {
  const jpeg = Buffer.from([255, 216, 255, ...Array(20).fill(0)])
  const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, ...Array(20).fill(0)])
  const webp = Buffer.from('RIFF0000WEBPVP8 ')
  assert.equal(menuImageExtension(jpeg, 'image/jpeg'), 'jpg')
  assert.equal(menuImageExtension(png, 'image/png'), 'png')
  assert.equal(menuImageExtension(webp, 'image/webp'), 'webp')
  assert.equal(MAX_MENU_IMAGE_BYTES, 3 * 1024 * 1024)
})

test('rejects spoofed MIME types, SVG, truncated and empty content', () => {
  assert.equal(menuImageExtension(Buffer.from('<svg onload="alert(1)"></svg>'), 'image/png'), null)
  assert.equal(menuImageExtension(Buffer.from('<svg></svg>'), 'image/svg+xml'), null)
  assert.equal(menuImageExtension(Buffer.from([255, 216, 255]), 'image/jpeg'), null)
  assert.equal(menuImageExtension(Buffer.alloc(0), 'image/png'), null)
  assert.equal(menuImageExtension(Buffer.from('RIFF0000WEBPVP8 '), 'image/jpeg'), null)
})
