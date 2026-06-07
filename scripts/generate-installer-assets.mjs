// 零依赖生成 NSIS 安装向导品牌位图（24bpp BMP）：
//   build/installerSidebar.bmp   164×314  欢迎/完成页左侧大图
//   build/uninstallerSidebar.bmp 164×314  卸载向导左侧大图
//   build/installerHeader.bmp    150×57   内页顶部条（左白留给标题，右侧渐变 + L）
// 运行：node scripts/generate-installer-assets.mjs
import { writeFileSync, mkdirSync } from 'node:fs'

const c0 = [0x38, 0xbd, 0xf8] // #38bdf8
const c1 = [0x81, 0x8c, 0xf8] // #818cf8
const lerp = (a, b, t) => Math.round(a + (b - a) * t)

/** 生成 24bpp BI_RGB 位图（bottom-up），drawPixel 用左上原点坐标 */
function bmp(width, height, drawPixel) {
  const rowSize = (width * 3 + 3) & ~3
  const imgSize = rowSize * height
  const fileSize = 54 + imgSize
  const buf = Buffer.alloc(fileSize)
  buf.write('BM', 0, 'ascii')
  buf.writeUInt32LE(fileSize, 2)
  buf.writeUInt32LE(54, 10) // 像素数据偏移
  buf.writeUInt32LE(40, 14) // BITMAPINFOHEADER 大小
  buf.writeInt32LE(width, 18)
  buf.writeInt32LE(height, 22) // 正高 => 自底向上
  buf.writeUInt16LE(1, 26) // planes
  buf.writeUInt16LE(24, 28) // bpp
  buf.writeUInt32LE(imgSize, 34)
  buf.writeInt32LE(2835, 38) // 72dpi
  buf.writeInt32LE(2835, 42)
  for (let y = 0; y < height; y++) {
    const srcY = height - 1 - y // 文件第 0 行是图像底部
    let off = 54 + y * rowSize
    for (let x = 0; x < width; x++) {
      const [r, g, b] = drawPixel(x, srcY, width, height)
      buf[off++] = b
      buf[off++] = g
      buf[off++] = r
    }
  }
  return buf
}

function sidebar(x, y, w, h) {
  const t = y / (h - 1) // 纵向渐变
  let r = lerp(c0[0], c1[0], t)
  let g = lerp(c0[1], c1[1], t)
  let b = lerp(c0[2], c1[2], t)
  const vBar = x >= 60 && x < 80 && y >= 110 && y < 210
  const hBar = x >= 60 && x < 128 && y >= 190 && y < 210
  if (vBar || hBar) r = g = b = 255 // 白色 L 标识
  return [r, g, b]
}

function header(x, y, w, h) {
  if (x < 96) return [255, 255, 255] // 左侧白底，留给标题文字
  const t = (x - 96) / (w - 96)
  let r = lerp(c0[0], c1[0], t)
  let g = lerp(c0[1], c1[1], t)
  let b = lerp(c0[2], c1[2], t)
  const vBar = x >= 112 && x < 118 && y >= 16 && y < 42
  const hBar = x >= 112 && x < 136 && y >= 36 && y < 42
  if (vBar || hBar) r = g = b = 255
  return [r, g, b]
}

mkdirSync(new URL('../build/', import.meta.url), { recursive: true })
writeFileSync(new URL('../build/installerSidebar.bmp', import.meta.url), bmp(164, 314, sidebar))
writeFileSync(new URL('../build/uninstallerSidebar.bmp', import.meta.url), bmp(164, 314, sidebar))
writeFileSync(new URL('../build/installerHeader.bmp', import.meta.url), bmp(150, 57, header))
console.log('NSIS 品牌位图生成完毕：installerSidebar / uninstallerSidebar / installerHeader')
