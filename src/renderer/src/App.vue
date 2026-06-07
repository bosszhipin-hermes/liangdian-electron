<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { AppInfo, OsInfo, ThemeState, ThemeSource } from '@shared/ipc'

const REPO_URL = 'https://github.com/bosszhipin-hermes/liangdian-electron'

const info = ref<AppInfo | null>(null)
const os = ref<OsInfo | null>(null)
const theme = ref<ThemeState | null>(null)
const autoLaunch = ref(false)
const isMaximized = ref(false)
const lastFilePath = ref('')
const logs = ref<string[]>([])

const offs: Array<() => void> = []

function log(msg: string): void {
  logs.value = [msg, ...logs.value].slice(0, 8)
}

function formatGB(bytes: number): string {
  return (bytes / 1024 / 1024 / 1024).toFixed(1) + ' GB'
}

onMounted(async () => {
  info.value = await window.api.app.getInfo()
  os.value = await window.api.system.getOsInfo()
  theme.value = await window.api.theme.get()
  autoLaunch.value = await window.api.app.getAutoLaunch()

  offs.push(
    window.api.on('window:maximize-changed', (state) => (isMaximized.value = state)),
    window.api.on('theme:changed', (state) => {
      theme.value = state
      log(`系统主题推送：${state.shouldUseDarkColors ? '深色' : '浅色'}`)
    })
  )
})

onUnmounted(() => offs.forEach((off) => off()))

// —— 窗口控制 ——
const minimize = (): Promise<void> => window.api.window.minimize()
const close = (): Promise<void> => window.api.window.close()
const toggleMaximize = async (): Promise<void> => {
  isMaximized.value = await window.api.window.toggleMaximize()
}

// —— 系统能力 ——
async function notify(): Promise<void> {
  await window.api.system.notify({ title: 'Liangdian', body: '这是一条来自主进程的原生系统通知' })
  log('已触发原生通知')
}

async function openFile(): Promise<void> {
  const res = await window.api.dialog.openTextFile()
  if (res.canceled || !res.path) return log('打开文件：已取消')
  lastFilePath.value = res.path
  log(`打开 ${res.path}（${res.content?.length ?? 0} 字符）`)
}

async function saveText(): Promise<void> {
  const res = await window.api.dialog.saveText(`Liangdian 演示导出\n时间戳占位\n${REPO_URL}\n`)
  if (res.canceled || !res.path) return log('保存文件：已取消')
  lastFilePath.value = res.path
  log(`已保存到 ${res.path}`)
}

async function copyText(): Promise<void> {
  await window.api.clipboard.writeText(REPO_URL)
  log('已复制仓库地址到剪贴板')
}

async function readClip(): Promise<void> {
  const text = await window.api.clipboard.readText()
  log(`剪贴板内容：${text || '(空)'}`)
}

async function reveal(): Promise<void> {
  if (!lastFilePath.value) return log('请先打开或保存一个文件')
  await window.api.shell.showItemInFolder(lastFilePath.value)
  log(`已在文件管理器中定位：${lastFilePath.value}`)
}

async function openRepo(): Promise<void> {
  await window.api.shell.openExternal(REPO_URL)
  log('已用系统浏览器打开仓库')
}

async function toggleAutoLaunch(): Promise<void> {
  autoLaunch.value = await window.api.app.setAutoLaunch(!autoLaunch.value)
  log(`开机自启：${autoLaunch.value ? '已开启' : '已关闭'}`)
}

async function setTheme(source: ThemeSource): Promise<void> {
  theme.value = await window.api.theme.set(source)
  log(`主题切换为：${source}`)
}
</script>

<template>
  <div class="app" :class="{ light: theme && !theme.shouldUseDarkColors }">
    <!-- 自绘标题栏 -->
    <header class="titlebar">
      <div class="brand">Liangdian</div>
      <div class="controls">
        <button class="ctrl" title="最小化" @click="minimize">─</button>
        <button class="ctrl" :title="isMaximized ? '还原' : '最大化'" @click="toggleMaximize">
          {{ isMaximized ? '❐' : '▢' }}
        </button>
        <button class="ctrl close" title="关闭" @click="close">✕</button>
      </div>
    </header>

    <main class="page">
      <header class="hero">
        <h1 class="logo">Liangdian</h1>
        <p class="subtitle">Electron + Vue3 · 对接 Win/Mac 系统 API</p>
      </header>

      <!-- 运行时 / 系统信息 -->
      <section v-if="info && os" class="cards">
        <div class="card"><span class="label">应用</span><span class="value">{{ info.name }} v{{ info.version }}</span></div>
        <div class="card"><span class="label">系统</span><span class="value">{{ os.type }} {{ os.release }}</span></div>
        <div class="card"><span class="label">平台</span><span class="value">{{ info.platform }} / {{ info.arch }}</span></div>
        <div class="card"><span class="label">CPU</span><span class="value sm">{{ os.cpu }} ×{{ os.cpuCount }}</span></div>
        <div class="card"><span class="label">内存</span><span class="value">{{ formatGB(os.freeMem) }} / {{ formatGB(os.totalMem) }}</span></div>
        <div class="card"><span class="label">Electron</span><span class="value">{{ info.versions.electron }}</span></div>
      </section>

      <!-- 系统能力 -->
      <section class="panel">
        <h2 class="panel-title">系统能力（通过类型安全 IPC 对接系统 API）</h2>
        <div class="actions">
          <button class="btn" @click="notify">🔔 原生通知</button>
          <button class="btn" @click="openFile">📂 打开文件</button>
          <button class="btn" @click="saveText">💾 保存文本</button>
          <button class="btn" @click="copyText">📋 写剪贴板</button>
          <button class="btn" @click="readClip">📥 读剪贴板</button>
          <button class="btn" @click="reveal">🗂 文件管理器定位</button>
          <button class="btn" @click="openRepo">🌐 系统浏览器打开</button>
          <button class="btn" :class="{ on: autoLaunch }" @click="toggleAutoLaunch">
            ⚡ 开机自启：{{ autoLaunch ? '开' : '关' }}
          </button>
        </div>

        <div class="theme-row">
          <span class="theme-label">系统主题</span>
          <button
            v-for="s in (['system', 'light', 'dark'] as ThemeSource[])"
            :key="s"
            class="chip"
            :class="{ active: theme?.source === s }"
            @click="setTheme(s)"
          >
            {{ s === 'system' ? '跟随系统' : s === 'light' ? '浅色' : '深色' }}
          </button>
        </div>
      </section>

      <!-- 操作日志 -->
      <section class="logbox">
        <div v-if="logs.length === 0" class="log empty">点击上方按钮，结果会显示在这里…</div>
        <div v-for="(line, i) in logs" :key="i" class="log">› {{ line }}</div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  color: var(--text);
  /* 主题相关变量（深色为默认，.light 覆盖） */
  --titlebar-bg: #0b1220;
  --border: #334155;
}
.app.light {
  --bg: #f1f5f9;
  --card: #ffffff;
  --accent: #0284c7;
  --text: #0f172a;
  --muted: #64748b;
  --titlebar-bg: #e2e8f0;
  --border: #cbd5e1;
}

.titlebar {
  height: 36px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--titlebar-bg);
  border-bottom: 1px solid var(--border);
  -webkit-app-region: drag;
}
.brand {
  padding-left: 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
}
.controls {
  display: flex;
  height: 100%;
  -webkit-app-region: no-drag;
}
.ctrl {
  width: 46px;
  height: 100%;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
}
.ctrl:hover {
  background: var(--border);
}
.ctrl.close:hover {
  background: #e11d48;
  color: #fff;
}

.page {
  flex: 1;
  overflow-y: auto;
  padding: 28px 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.hero {
  text-align: center;
}
.logo {
  font-size: 44px;
  background: linear-gradient(120deg, #38bdf8, #818cf8);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.subtitle {
  color: var(--muted);
  margin-top: 4px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.label {
  color: var(--muted);
  font-size: 12px;
}
.value {
  font-size: 15px;
  font-weight: 600;
  color: var(--accent);
}
.value.sm {
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
}

.panel {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px;
}
.panel-title {
  font-size: 14px;
  margin-bottom: 14px;
}
.actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.btn {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: transparent;
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
  transition: 0.15s;
}
.btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.btn.on {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.theme-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}
.theme-label {
  font-size: 13px;
  color: var(--muted);
  margin-right: 4px;
}
.chip {
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: transparent;
  color: var(--text);
  font-size: 12px;
  cursor: pointer;
}
.chip.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.logbox {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px;
  min-height: 90px;
  font-size: 12px;
  font-family: 'SF Mono', Consolas, monospace;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.log {
  color: var(--accent);
}
.log.empty {
  color: var(--muted);
}
</style>
