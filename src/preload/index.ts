import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 自定义对外暴露给渲染层的 API（后续在这里挂载系统能力）
const api = {}

// 通过 contextBridge 安全暴露，避免在渲染层直接拿到 Node/Electron 能力
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (在 d.ts 中声明类型)
  window.electron = electronAPI
  // @ts-ignore (在 d.ts 中声明类型)
  window.api = api
}
