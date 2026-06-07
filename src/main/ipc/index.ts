import { ipcMain, type BrowserWindow } from 'electron'
import type { IpcInvokeChannel, IpcInvokeMap, IpcEventChannel, IpcEventMap } from '../../shared/ipc'
import { registerAppHandlers } from './app'
import { registerWindowHandlers } from './window'

/**
 * 类型安全的 `ipcMain.handle` 封装。
 * `channel` 必须是契约中的通道；`handler` 的参数与返回值都被该通道的类型约束。
 */
export function handle<C extends IpcInvokeChannel>(
  channel: C,
  handler: (
    event: Electron.IpcMainInvokeEvent,
    ...args: IpcInvokeMap[C]['args']
  ) => IpcInvokeMap[C]['return'] | Promise<IpcInvokeMap[C]['return']>
): void {
  ipcMain.handle(channel, handler as Parameters<typeof ipcMain.handle>[1])
}

/**
 * 类型安全的「主进程 → 渲染层」事件推送。
 * `channel` 与 `payload` 都被契约约束。
 */
export function sendToWindow<C extends IpcEventChannel>(
  win: BrowserWindow,
  channel: C,
  payload: IpcEventMap[C]
): void {
  win.webContents.send(channel, payload)
}

/** 统一注册所有 IPC handler，在 app ready 后调用一次 */
export function registerIpcHandlers(): void {
  registerAppHandlers()
  registerWindowHandlers()
}
