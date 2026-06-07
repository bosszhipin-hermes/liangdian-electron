/**
 * IPC 契约 —— 主进程与渲染层通信的「单一事实来源」。
 *
 * 新增任何通道都在这里登记类型，main / preload / renderer 三端共享同一份定义，
 * 从而做到全链路类型安全：通道名写错、参数或返回值不符 —— 编译期直接报错。
 */

/** 应用与运行时信息 */
export interface AppInfo {
  name: string
  version: string
  platform: NodeJS.Platform
  arch: string
  versions: {
    electron: string
    chrome: string
    node: string
    v8: string
  }
}

/**
 * 渲染层 → 主进程：请求 / 响应（ipcRenderer.invoke ↔ ipcMain.handle）
 * 每个通道声明入参 `args` 与返回 `return`。
 */
export interface IpcInvokeMap {
  'app:getInfo': { args: []; return: AppInfo }
  'window:minimize': { args: []; return: void }
  'window:toggleMaximize': { args: []; return: boolean } // 返回切换后是否处于最大化
  'window:close': { args: []; return: void }
}

/**
 * 主进程 → 渲染层：事件推送（webContents.send ↔ ipcRenderer.on）
 * 值即事件载荷类型。
 */
export interface IpcEventMap {
  'window:maximize-changed': boolean // 窗口最大化状态变化
}

export type IpcInvokeChannel = keyof IpcInvokeMap
export type IpcEventChannel = keyof IpcEventMap

/**
 * preload 通过 contextBridge 暴露给渲染层的 API 形状（即 `window.api`）。
 * preload 侧据此实现（实现必须匹配本类型），renderer 侧据此获得类型与补全。
 */
export interface ExposedApi {
  app: {
    getInfo(): Promise<AppInfo>
  }
  window: {
    minimize(): Promise<void>
    toggleMaximize(): Promise<boolean>
    close(): Promise<void>
  }
  /** 订阅主进程推送的事件，返回取消订阅函数 */
  on<C extends IpcEventChannel>(channel: C, listener: (payload: IpcEventMap[C]) => void): () => void
}
