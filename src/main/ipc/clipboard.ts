import { clipboard } from 'electron'
import { handle } from './index'

/** 剪贴板读写 */
export function registerClipboardHandlers(): void {
  handle('clipboard:writeText', (_event, text) => {
    clipboard.writeText(text)
  })

  handle('clipboard:readText', () => clipboard.readText())
}
