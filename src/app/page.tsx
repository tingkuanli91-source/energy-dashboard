'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface EnergyData {
  timestamp: string
  powerGeneration: {
    total: number
    solar: number
    wind: number
    grid: number
    storage: number
  }
  powerConsumption: {
    total: number
    load: number
  }
  carbonReduction: number
  energyMix: {
    solar: number
    wind: number
    grid: number
    storage: number
  }
  stations: Array<{
    id: number
    name: string
    status: string
    power: number
    location: { lat: number; lng: number }
  }>
  loadCurve: Array<{ hour: number; value: number }>
  weeklyEfficiency: Array<{ day: string; value: number }>
  logs: Array<{ time: string; level: string; message: string }>
  systemStatus: {
    status: string
    alerts: number
  }
}

export default function Dashboard() {
  const [data, setData] = useState<EnergyData | null>(null)
  const [currentTime, setCurrentTime] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch data from API
  const fetchData = async () => {
    try {
      const res = await fetch('/api/energy')
      const newData = await res.json()
      setData(newData)
      setCurrentTime(new Date(newData.timestamp).toLocaleString('zh-TW'))
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  // Update clock every second
  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      setCurrentTime(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      )
    }
    const clockInterval = setInterval(updateClock, 1000)
    updateClock()
    return () => clearInterval(clockInterval)
  }, [])

  if (loading || !data) {
    return (
      <div className="h-screen flex items-center justify-center bg-deep-bg">
        <div className="text-neon-blue text-xl animate-pulse">載入中...</div>
      </div>
    )
  }

  // Chart configurations
  const doughnutData = {
    labels: ['太陽能', '風能', '電網', '儲能'],
    datasets: [{
      data: [data.energyMix.solar, data.energyMix.wind, data.energyMix.grid, data.energyMix.storage],
      backgroundColor: ['#fbbf24', '#60a5fa', '#34d399', '#9ca3af'],
      borderWidth: 0,
      hoverOffset: 10
    }]
  }

  const lineData = {
    labels: data.loadCurve.map(d => `${d.hour}:00`),
    datasets: [{
      label: '負荷 (MW)',
      data: data.loadCurve.map(d => d.value),
      borderColor: '#00f2ff',
      borderWidth: 2,
      pointRadius: 0,
      fill: true,
      backgroundColor: 'rgba(0, 242, 255, 0.1)',
      tension: 0.4
    }]
  }

  const barData = {
    labels: data.weeklyEfficiency.map(d => d.day),
    datasets: [{
      label: '效率 %',
      data: data.weeklyEfficiency.map(d => d.value),
      backgroundColor: 'rgba(57, 255, 20, 0.4)',
      borderColor: '#39ff14',
      borderWidth: 1,
      borderRadius: 4
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  }

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666', size: 10 } },
      x: { grid: { display: false }, ticks: { color: '#666', size: 10 } }
    }
  }

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666', size: 10 } },
      x: { grid: { display: false }, ticks: { color: '#666', size: 10 } }
    }
  }

  const doughnutOptions = {
    ...chartOptions,
    cutout: '70%'
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-neon-green'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-600'
      default: return 'bg-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal': return '正常'
      case 'warning': return '負載過高'
      case 'critical': return '通訊中斷'
      default: return '未知'
    }
  }

  const getLogColor = (level: string) => {
    switch (level) {
      case 'info': return 'border-neon-green text-neon-green'
      case 'warning': return 'border-yellow-500 text-yellow-500'
      case 'critical': return 'border-red-500 text-red-500'
      case 'system': return 'border-blue-500 text-blue-500'
      default: return 'border-gray-500 text-gray-500'
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-cyan-900/50 bg-black/40 z-50 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-blue-600 rounded-lg flex items-center justify-center glow-blue">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-widest neon-text-blue">能源管理指揮中心</h1>
        </div>
        <div className="flex items-center space-x-8">
          <div className="text-right">
            <p className="text-xs text-gray-400">當前時間</p>
            <p className="text-sm font-mono text-neon-green">{currentTime}</p>
          </div>
          <div className="flex space-x-2">
            <div className="px-3 py-1 border border-cyan-500/30 rounded text-xs bg-cyan-500/10">
              系統狀態: {data.systemStatus.status === 'normal' ? '正常' : '異常'}
            </div>
            <div className="px-3 py-1 border border-red-500/30 rounded text-xs bg-red-500/10">
              告警: {data.systemStatus.alerts}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-4 grid grid-cols-12 gap-4">
        {/* LEFT: KPI and Charts */}
        <section className="col-span-3 flex flex-col gap-4 overflow-y-auto">
          {/* KPI Panel */}
          <div className="glass-panel p-4 rounded-xl flex-shrink-0">
            <h2 className="text-sm font-semibold mb-4 border-l-4 border-neon-blue pl-2">關鍵效能指標 (KPI)</h2>
            <div className="space-y-4">
              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                <p className="text-gray-400 text-xs uppercase tracking-tighter">總發電量 (Current)</p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-bold neon-text-blue">{data.powerGeneration.total}</span>
                  <span className="text-xs text-neon-blue">MW</span>
                </div>
                <div className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
                  <div className="bg-neon-blue h-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                <p className="text-gray-400 text-xs uppercase tracking-tighter">當前能耗 (Load)</p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-bold neon-text-green">{data.powerConsumption.total}</span>
                  <span className="text-xs text-neon-green">MW</span>
                </div>
                <div className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
                  <div className="bg-neon-green h-full" style={{ width: '62%' }}></div>
                </div>
              </div>
              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                <p className="text-gray-400 text-xs uppercase tracking-tighter">碳減排量 (Reduction)</p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-bold text-white">{data.carbonReduction}</span>
                  <span className="text-xs text-gray-400">tCO2e</span>
                </div>
              </div>
            </div>
          </div>

          {/* Energy Mix Chart */}
          <div className="glass-panel p-4 rounded-xl flex-1">
            <h2 className="text-sm font-semibold mb-4 border-l-4 border-neon-blue pl-2">能源結構佔比</h2>
            <div className="relative h-48 w-full">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-[10px]">
              <div className="flex items-center"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span> 太陽能 ({data.energyMix.solar}%)</div>
              <div className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span> 風能 ({data.energyMix.wind}%)</div>
              <div className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span> 電網 ({data.energyMix.grid}%)</div>
              <div className="flex items-center"><span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span> 儲能 ({data.energyMix.storage}%)</div>
            </div>
          </div>
        </section>

        {/* CENTER: Map and Load Chart */}
        <section className="col-span-6 flex flex-col gap-4">
          {/* Map */}
          <div className="glass-panel rounded-xl flex-1 relative overflow-hidden">
            <div className="absolute top-4 left-4 z-20 flex flex-col space-y-2">
              <button className="bg-black/60 p-2 border border-neon-blue/40 rounded hover:bg-neon-blue/20 transition">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"></path></svg>
              </button>
              <button className="bg-black/60 p-2 border border-neon-blue/40 rounded hover:bg-neon-blue/20 transition">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 12H4"></path></svg>
              </button>
            </div>
            <div className="absolute inset-0 bg-[#0d1117] flex items-center justify-center">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#00f2ff 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }}></div>
              
              {/* Station Markers */}
              {data.stations.map((station) => (
                <div 
                  key={station.id}
                  className={`absolute ${station.id === 1 ? 'top-1/4 left-1/3' : station.id === 2 ? 'bottom-1/3 right-1/4' : 'top-1/2 right-1/2'} group/marker cursor-pointer`}
                >
                  <div className={`w-4 h-4 ${getStatusColor(station.status)} rounded-full animate-ping absolute opacity-75`}></div>
                  <div className={`w-4 h-4 ${getStatusColor(station.status)} rounded-full relative shadow-[0_0_10px_currentColor]`}></div>
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/80 border border-gray-600 px-2 py-1 rounded text-[10px] whitespace-nowrap hidden group-hover/marker:block">
                    {station.name} - {getStatusText(station.status)}
                  </div>
                </div>
              ))}
              
              <p className="text-gray-600 uppercase tracking-[1em] select-none">區域地圖數據可視化</p>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div className="glass-panel p-3 rounded-lg text-xs space-y-1">
                {data.stations.map((station) => (
                  <div key={station.id} className="flex items-center space-x-2">
                    <div className={`w-2 h-2 ${getStatusColor(station.status)} rounded-full`}></div>
                    <span>{station.name}: {station.status === 'normal' ? '運行中' : '異常'} ({station.power}kW)</span>
                  </div>
                ))}
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-500 uppercase">Coordinate System: WGS84</span>
              </div>
            </div>
          </div>

          {/* Load Chart */}
          <div className="glass-panel p-4 rounded-xl h-48">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-semibold border-l-4 border-neon-blue pl-2">實時負載曲線 (24H)</h2>
              <span className="text-[10px] text-neon-blue animate-pulse">● LIVE</span>
            </div>
            <div className="h-32">
              <Line data={lineData} options={lineChartOptions} />
            </div>
          </div>
        </section>

        {/* RIGHT: Efficiency and Logs */}
        <section className="col-span-3 flex flex-col gap-4 overflow-y-auto">
          {/* Weekly Efficiency */}
          <div className="glass-panel p-4 rounded-xl h-1/2">
            <h2 className="text-sm font-semibold mb-4 border-l-4 border-neon-blue pl-2">週效能分析</h2>
            <div className="h-64">
              <Bar data={barData} options={barChartOptions} />
            </div>
          </div>

          {/* System Logs */}
          <div className="glass-panel p-4 rounded-xl flex-1 overflow-hidden flex flex-col">
            <h2 className="text-sm font-semibold mb-3 border-l-4 border-red-500 pl-2">系統事件日誌</h2>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 text-[11px] font-mono">
              {data.logs.map((log, index) => (
                <div key={index} className={`p-2 bg-black/20 border-l-2 ${getLogColor(log.level)}`}>
                  <span className="text-gray-500">[{log.time}]</span> <span className="uppercase">{log.level}:</span> {log.message}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="h-8 bg-black/60 border-t border-cyan-900/30 px-6 flex items-center justify-between text-[10px] text-gray-500 flex-shrink-0">
        <div className="flex space-x-4">
          <span>數據更新頻率: 10s</span>
          <span>|</span>
          <span>通訊協議: MQTT / Modbus TCP</span>
        </div>
        <div>
          © 2023 智能能源指揮平台 - 核心版本 v2.4.0
        </div>
      </footer>
    </div>
  )
}
