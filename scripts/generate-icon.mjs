// 零依赖生成 1024×1024 应用图标 PNG（渐变底 + 白色「L」标识）。
// electron-builder 会据此自动生成 macOS .icns / Windows .ico。
// 运行：node scripts/generate-icon.mjs
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

const SIZE = 1024

// —— CRC32（PNG chunk 校验）——
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}

// —— 像素绘制 ——
const c0 = [0x38, 0xbd, 0xf8] // #38bdf8
const c1 = [0x81, 0x8c, 0xf8] // #818cf8
const lerp = (a, b, t) => Math.round(a + (b - a) * t)

const R = 180 // 圆角半径
function alphaAt(x, y) {
  const ix = Math.min(x, SIZE - 1 - x)
  const iy = Math.min(y, SIZE - 1 - y)
  if (ix >= R || iy >= R) return 255
  const dx = R - ix
  const dy = R - iy
  const d = Math.sqrt(dx * dx + dy * dy)
  if (d <= R - 1) return 255
  if (d >= R + 1) return 0
  return Math.round(((R + 1 - d) / 2) * 255) // 边缘抗锯齿
}

function isMark(x, y) {
  const vBar = x >= 364 && x < 464 && y >= 300 && y < 724 // 竖
  const hBar = x >= 364 && x < 660 && y >= 634 && y < 724 // 横（底）
  return vBar || hBar
}

const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1))
let p = 0
for (let y = 0; y < SIZE; y++) {
  raw[p++] = 0 // 行过滤器：None
  for (let x = 0; x < SIZE; x++) {
    const t = (x + y) / (2 * (SIZE - 1))
    let r = lerp(c0[0], c1[0], t)
    let g = lerp(c0[1], c1[1], t)
    let b = lerp(c0[2], c1[2], t)
    if (isMark(x, y)) {
      r = g = b = 255
    }
    raw[p++] = r
    raw[p++] = g
    raw[p++] = b
    raw[p++] = alphaAt(x, y)
  }
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(SIZE, 0)
ihdr.writeUInt32BE(SIZE, 4)
ihdr[8] = 8 // bit depth
ihdr[9] = 6 // color type: RGBA
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0))
])

mkdirSync(new URL('../build/', import.meta.url), { recursive: true })
writeFileSync(new URL('../build/icon.png', import.meta.url), png)
console.log(`build/icon.png 生成完毕：${SIZE}×${SIZE}, ${png.length} 字节`)
