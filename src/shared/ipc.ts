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

/** 操作系统信息（对接系统 API 演示） */
export interface OsInfo {
  type: string // os.type()，如 Darwin / Windows_NT
  release: string // 内核版本
  arch: string
  hostname: string
  cpu: string // 首颗 CPU 型号
  cpuCount: number
  totalMem: number // 字节
  freeMem: number // 字节
  uptime: number // 秒
}

/** 系统主题来源与状态 */
export type ThemeSource = 'system' | 'light' | 'dark'
export interface ThemeState {
  source: ThemeSource
  shouldUseDarkColors: boolean
}

/** 打开文本文件结果 */
export interface OpenFileResult {
  canceled: boolean
  path?: string
  content?: string
}

/** 保存文本结果 */
export interface SaveTextResult {
  canceled: boolean
  path?: string
}

/**
 * 渲染层 → 主进程：请求 / 响应（ipcRenderer.invoke ↔ ipcMain.handle）
 * 每个通道声明入参 `args` 与返回 `return`。
 */
export interface IpcInvokeMap {
  // —— 应用 / 自启 ——
  'app:getInfo': { args: []; return: AppInfo }
  'app:getAutoLaunch': { args: []; return: boolean }
  'app:setAutoLaunch': { args: [enabled: boolean]; return: boolean } // 返回设置后的状态

  // —— 窗口控制 ——
  'window:minimize': { args: []; return: void }
  'window:toggleMaximize': { args: []; return: boolean } // 返回切换后是否处于最大化
  'window:close': { args: []; return: void }

  // —— 系统能力 ——
  'system:notify': { args: [payload: { title: string; body: string }]; return: void }
  'system:getOsInfo': { args: []; return: OsInfo }

  // —— 文件对话框 ——
  'dialog:openTextFile': { args: []; return: OpenFileResult }
  'dialog:saveText': { args: [content: string]; return: SaveTextResult }

  // —— 剪贴板 ——
  'clipboard:writeText': { args: [text: string]; return: void }
  'clipboard:readText': { args: []; return: string }

  // —— Shell ——
  'shell:showItemInFolder': { args: [path: string]; return: void }
  'shell:openExternal': { args: [url: string]; return: void }

  // —— 系统主题 ——
  'theme:get': { args: []; return: ThemeState }
  'theme:set': { args: [source: ThemeSource]; return: ThemeState }
}

/**
 * 主进程 → 渲染层：事件推送（webContents.send ↔ ipcRenderer.on）
 * 值即事件载荷类型。
 */
export interface IpcEventMap {
  'window:maximize-changed': boolean // 窗口最大化状态变化
  'theme:changed': ThemeState // 系统主题变化
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
    getAutoLaunch(): Promise<boolean>
    setAutoLaunch(enabled: boolean): Promise<boolean>
  }
  window: {
    minimize(): Promise<void>
    toggleMaximize(): Promise<boolean>
    close(): Promise<void>
  }
  system: {
    notify(payload: { title: string; body: string }): Promise<void>
    getOsInfo(): Promise<OsInfo>
  }
  dialog: {
    openTextFile(): Promise<OpenFileResult>
    saveText(content: string): Promise<SaveTextResult>
  }
  clipboard: {
    writeText(text: string): Promise<void>
    readText(): Promise<string>
  }
  shell: {
    showItemInFolder(path: string): Promise<void>
    openExternal(url: string): Promise<void>
  }
  theme: {
    get(): Promise<ThemeState>
    set(source: ThemeSource): Promise<ThemeState>
  }
  /** 订阅主进程推送的事件，返回取消订阅函数 */
  on<C extends IpcEventChannel>(channel: C, listener: (payload: IpcEventMap[C]) => void): () => void
}
