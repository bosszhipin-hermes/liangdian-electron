import { shell } from 'electron'
import { handle } from './index'

/** Shell：在文件管理器中显示、用系统浏览器打开外链 */
export function registerShellHandlers(): void {
  handle('shell:showItemInFolder', (_event, path) => {
    shell.showItemInFolder(path)
  })

  handle('shell:openExternal', async (_event, url) => {
    await shell.openExternal(url)
  })
}
