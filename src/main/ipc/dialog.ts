import { dialog, BrowserWindow } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
import { handle } from './index'
import type { OpenFileResult, SaveTextResult } from '../../shared/ipc'

/** 文件对话框：打开 / 保存文本文件（对接系统原生对话框） */
export function registerDialogHandlers(): void {
  handle('dialog:openTextFile', async (event): Promise<OpenFileResult> => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const options: Electron.OpenDialogOptions = {
      properties: ['openFile'],
      filters: [
        { name: '文本文件', extensions: ['txt', 'md', 'json', 'log', 'js', 'ts', 'vue'] },
        { name: '所有文件', extensions: ['*'] }
      ]
    }
    const result = win
      ? await dialog.showOpenDialog(win, options)
      : await dialog.showOpenDialog(options)
    if (result.canceled || result.filePaths.length === 0) return { canceled: true }
    const path = result.filePaths[0]
    const content = await readFile(path, 'utf-8')
    return { canceled: false, path, content }
  })

  handle('dialog:saveText', async (event, content): Promise<SaveTextResult> => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const options: Electron.SaveDialogOptions = { defaultPath: 'untitled.txt' }
    const result = win
      ? await dialog.showSaveDialog(win, options)
      : await dialog.showSaveDialog(options)
    if (result.canceled || !result.filePath) return { canceled: true }
    await writeFile(result.filePath, content, 'utf-8')
    return { canceled: false, path: result.filePath }
  })
}
