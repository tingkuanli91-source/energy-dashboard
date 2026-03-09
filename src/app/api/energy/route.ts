import { NextResponse } from 'next/server'

// 模擬數據生成器
function generateMockData() {
  const now = new Date()
  
  // 隨機波動值
  const randomFluctuation = (base: number, variance: number) => 
    base + (Math.random() - 0.5) * variance

  // 發電量數據 (MW)
  const powerGeneration = {
    total: Number(randomFluctuation(1248.5, 100).toFixed(1)),
    solar: Number(randomFluctuation(435, 50).toFixed(1)),
    wind: Number(randomFluctuation(312, 30).toFixed(1)),
    grid: Number(randomFluctuation(374, 40).toFixed(1)),
    storage: Number(randomFluctuation(127, 20).toFixed(1)),
  }

  // 能耗數據 (MW)
  const powerConsumption = {
    total: Number(randomFluctuation(982.1, 80).toFixed(1)),
    load: Number(randomFluctuation(75, 10).toFixed(1)),
  }

  // 碳減排量 (tCO2e)
  const carbonReduction = Number(randomFluctuation(45.2, 5).toFixed(1))

  // 能源結構佔比
  const energyMix = {
    solar: 35,
    wind: 25,
    grid: 30,
    storage: 10,
  }

  // 發電站點狀態
  const stations = [
    {
      id: 1,
      name: '北部一號場站',
      status: 'normal',
      power: Math.floor(randomFluctuation(240, 30)),
      location: { lat: 25.05, lng: 121.5 }
    },
    {
      id: 2,
      name: '中部三號場站',
      status: Math.random() > 0.7 ? 'warning' : 'normal',
      power: Math.floor(randomFluctuation(180, 40)),
      location: { lat: 24.15, lng: 120.6 }
    },
    {
      id: 3,
      name: '南部區域站',
      status: Math.random() > 0.9 ? 'critical' : 'normal',
      power: Math.floor(randomFluctuation(320, 50)),
      location: { lat: 22.63, lng: 120.3 }
    },
  ]

  // 負載曲線 (24小時)
  const loadCurve = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    value: Math.floor(
      i >= 6 && i <= 22 
        ? 600 + Math.sin((i - 6) * Math.PI / 8) * 400 + Math.random() * 100
        : 300 + Math.random() * 100
    )
  }))

  // 每週效率數據
  const weeklyEfficiency = [
    { day: '一', value: Math.floor(randomFluctuation(88, 5)) },
    { day: '二', value: Math.floor(randomFluctuation(92, 5)) },
    { day: '三', value: Math.floor(randomFluctuation(85, 5)) },
    { day: '四', value: Math.floor(randomFluctuation(94, 5)) },
    { day: '五', value: Math.floor(randomFluctuation(91, 5)) },
    { day: '六', value: Math.floor(randomFluctuation(78, 5)) },
    { day: '日', value: Math.floor(randomFluctuation(82, 5)) },
  ]

  // 系統日誌
  const logs = [
    { time: '14:28:10', level: 'info', message: '北部場站逆變器已啟動' },
    { time: '14:25:32', level: 'warning', message: '中部電壓波動超出預設值' },
    { time: '14:12:05', level: 'critical', message: '南部通訊鏈路丟失' },
    { time: '14:00:00', level: 'system', message: '自動生成整點報告' },
    { time: '13:45:12', level: 'info', message: '電池儲能系統進入放電模式' },
  ]

  return {
    timestamp: now.toISOString(),
    powerGeneration,
    powerConsumption,
    carbonReduction,
    energyMix,
    stations,
    loadCurve,
    weeklyEfficiency,
    logs,
    systemStatus: {
      status: 'normal',
      alerts: stations.filter(s => s.status !== 'normal').length,
    }
  }
}

export async function GET() {
  const data = generateMockData()
  return NextResponse.json(data)
}
