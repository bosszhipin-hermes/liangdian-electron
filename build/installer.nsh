; Liangdian 自定义 NSIS 安装脚本
; 由 electron-builder 通过 nsis.include 引入，提供可重写的钩子宏。
; 可用钩子：customHeader / preInit / customInit / customInstall / customUnInstall 等。

!macro customHeader
  ; —— 安装向导文案品牌化（中文）——
  !define MUI_WELCOMEPAGE_TITLE "欢迎安装 Liangdian"
  !define MUI_WELCOMEPAGE_TEXT "本向导将引导你安装 Liangdian —— 基于 Electron + Vue3 的跨平台桌面应用。$\r$\n$\r$\n继续前建议关闭其他正在运行的程序。"
  !define MUI_FINISHPAGE_TITLE "安装完成"
  !define MUI_FINISHPAGE_TEXT "Liangdian 已成功安装到你的电脑。$\r$\n点击「完成」结束安装向导。"
!macroend

!macro customInstall
  ; —— 写入应用注册信息（安装目录 / 版本），供卸载与外部检测使用 ——
  WriteRegStr HKCU "Software\Liangdian" "InstallDir" "$INSTDIR"
  WriteRegStr HKCU "Software\Liangdian" "Version" "${VERSION}"
  DetailPrint "Liangdian 已安装到：$INSTDIR"
!macroend

!macro customUnInstall
  ; —— 卸载时清理注册信息 ——
  DeleteRegKey HKCU "Software\Liangdian"
  DetailPrint "已清理 Liangdian 注册信息"
!macroend
