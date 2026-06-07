<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { AppInfo } from '@shared/ipc'

const info = ref<AppInfo | null>(null)
const isMaximized = ref(false)
let off: (() => void) | undefined

onMounted(async () => {
  // 渲染层 → 主进程：请求/响应（全程类型安全，info 自动推导为 AppInfo）
  info.value = await window.api.app.getInfo()
  // 主进程 → 渲染层：订阅最大化状态推送，返回取消订阅函数
  off = window.api.on('window:maximize-changed', (state) => {
    isMaximized.value = state
  })
})

onUnmounted(() => off?.())

const minimize = (): Promise<void> => window.api.window.minimize()
const close = (): Promise<void> => window.api.window.close()
const toggleMaximize = async (): Promise<void> => {
  isMaximized.value = await window.api.window.toggleMaximize()
}
</script>

<template>
  <div class="app">
    <!-- 自绘标题栏（整条可拖拽，按钮区禁止拖拽） -->
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
      <h1 class="logo">Liangdian</h1>
      <p class="subtitle">Electron + Vue3 · 类型安全 IPC 通信架构</p>

      <div v-if="info" class="cards">
        <div class="card"><span class="label">应用</span><span class="value">{{ info.name }} v{{ info.version }}</span></div>
        <div class="card"><span class="label">平台</span><span class="value">{{ info.platform }} / {{ info.arch }}</span></div>
        <div class="card"><span class="label">Electron</span><span class="value">{{ info.versions.electron }}</span></div>
        <div class="card"><span class="label">Chromium</span><span class="value">{{ info.versions.chrome }}</span></div>
        <div class="card"><span class="label">Node</span><span class="value">{{ info.versions.node }}</span></div>
        <div class="card"><span class="label">V8</span><span class="value">{{ info.versions.v8 }}</span></div>
      </div>

      <p class="hint">
        标题栏按钮经类型安全 IPC 调用主进程；最大化状态由主进程事件推送实时同步。
      </p>
    </main>
  </div>
</template>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.titlebar {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0b1220;
  border-bottom: 1px solid #1e293b;
  -webkit-app-region: drag; /* 整条标题栏可拖拽移动窗口 */
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
  -webkit-app-region: no-drag; /* 按钮区不拖拽，可点击 */
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
  background: #1e293b;
}
.ctrl.close:hover {
  background: #e11d48;
  color: #fff;
}
.page {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
}
.logo {
  font-size: 56px;
  background: linear-gradient(120deg, #38bdf8, #818cf8);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.subtitle {
  color: var(--muted);
  margin-bottom: 12px;
}
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.card {
  background: var(--card);
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 140px;
}
.label {
  color: var(--muted);
  font-size: 12px;
}
.value {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent);
}
.hint {
  margin-top: 8px;
  max-width: 520px;
  text-align: center;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
}
</style>
