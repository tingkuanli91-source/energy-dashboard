import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '能源管理看板 | Energy Management Dashboard',
  description: '智能能源指揮平台 - 即時監控與數據分析',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  )
}
