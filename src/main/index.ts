import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerIpcHandlers, sendToWindow } from './ipc'

function createWindow(): void {
  // 创建主窗口
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 720,
    show: false,
    frame: false, // 无边框：由渲染层自绘标题栏，窗口控制走 IPC（跨平台一致）
    autoHideMenuBar: true,
    title: 'Liangdian',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      // 安全基线：开启上下文隔离，关闭 nodeIntegration
      contextIsolation: true,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // 最大化状态变化 → 推送给渲染层，保持自绘标题栏按钮状态同步
  mainWindow.on('maximize', () => sendToWindow(mainWindow, 'window:maximize-changed', true))
  mainWindow.on('unmaximize', () => sendToWindow(mainWindow, 'window:maximize-changed', false))

  // 外部链接用系统浏览器打开，而不是在应用内开窗
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 开发环境加载 vite dev server，生产环境加载打包后的 html
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // Windows 任务栏应用标识
  electronApp.setAppUserModelId('com.liangdian.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 注册所有 IPC handler（统一入口）
  registerIpcHandlers()

  createWindow()

  app.on('activate', function () {
    // macOS：点击 Dock 图标且没有窗口时，重新创建窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  // macOS 下保留应用进程，符合平台习惯
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
