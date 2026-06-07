import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { ExposedApi, IpcEventChannel, IpcEventMap } from '../shared/ipc'

// 对外暴露给渲染层的 API：每个方法都走 invoke，类型全部来自 IPC 契约。
// 显式标注为 ExposedApi —— 实现与契约不符时编译期即报错。
const api: ExposedApi = {
  app: {
    getInfo: () => ipcRenderer.invoke('app:getInfo'),
    getAutoLaunch: () => ipcRenderer.invoke('app:getAutoLaunch'),
    setAutoLaunch: (enabled) => ipcRenderer.invoke('app:setAutoLaunch', enabled)
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    toggleMaximize: () => ipcRenderer.invoke('window:toggleMaximize'),
    close: () => ipcRenderer.invoke('window:close')
  },
  system: {
    notify: (payload) => ipcRenderer.invoke('system:notify', payload),
    getOsInfo: () => ipcRenderer.invoke('system:getOsInfo')
  },
  dialog: {
    openTextFile: () => ipcRenderer.invoke('dialog:openTextFile'),
    saveText: (content) => ipcRenderer.invoke('dialog:saveText', content)
  },
  clipboard: {
    writeText: (text) => ipcRenderer.invoke('clipboard:writeText', text),
    readText: () => ipcRenderer.invoke('clipboard:readText')
  },
  shell: {
    showItemInFolder: (path) => ipcRenderer.invoke('shell:showItemInFolder', path),
    openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url)
  },
  theme: {
    get: () => ipcRenderer.invoke('theme:get'),
    set: (source) => ipcRenderer.invoke('theme:set', source)
  },
  update: {
    check: () => ipcRenderer.invoke('update:check'),
    download: () => ipcRenderer.invoke('update:download'),
    install: () => ipcRenderer.invoke('update:install')
  },
  on: <C extends IpcEventChannel>(channel: C, listener: (payload: IpcEventMap[C]) => void) => {
    const wrapped = (_: Electron.IpcRendererEvent, payload: IpcEventMap[C]): void => listener(payload)
    ipcRenderer.on(channel, wrapped)
    // 返回取消订阅函数，供渲染层在组件卸载时清理
    return () => {
      ipcRenderer.removeListener(channel, wrapped)
    }
  }
}

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
