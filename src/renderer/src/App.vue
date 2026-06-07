<script setup lang="ts">
import { ref } from 'vue'

// 读取主进程通过 preload 暴露的运行时版本信息
const versions = ref(window.electron?.process?.versions ?? ({} as Record<string, string>))

function ping(): void {
  // 渲染层 -> 主进程 IPC 示例
  window.electron?.ipcRenderer.send('ping')
}
</script>

<template>
  <div class="page">
    <h1 class="logo">Liangdian</h1>
    <p class="subtitle">Electron + Vue3 跨平台桌面应用骨架</p>

    <div class="cards">
      <div class="card">
        <span class="label">Electron</span>
        <span class="value">{{ versions.electron }}</span>
      </div>
      <div class="card">
        <span class="label">Chromium</span>
        <span class="value">{{ versions.chrome }}</span>
      </div>
      <div class="card">
        <span class="label">Node</span>
        <span class="value">{{ versions.node }}</span>
      </div>
      <div class="card">
        <span class="label">V8</span>
        <span class="value">{{ versions.v8 }}</span>
      </div>
    </div>

    <button class="btn" @click="ping">测试 IPC（看主进程终端打印 pong）</button>
  </div>
</template>

<style scoped>
.page {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
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
  grid-template-columns: repeat(4, 1fr);
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
  min-width: 120px;
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
.btn {
  margin-top: 16px;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background: var(--accent);
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
}
.btn:hover {
  opacity: 0.9;
}
</style>
