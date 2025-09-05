'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

// Types
interface OptionsFlow {
  id: string
  symbol: string
  type: 'CALL' | 'PUT'
  strike: number
  volume: number
  premium: number
  timestamp: string
  iv: number
}

interface LogEntry {
  id: string
  level: 'INFO' | 'ERROR' | 'SUCCESS'
  message: string
  timestamp: string
  details?: any
}

// Logger utility
class Logger {
  private logs: LogEntry[] = []
  private listeners: ((logs: LogEntry[]) => void)[] = []

  log(level: LogEntry['level'], message: string, details?: any) {
    const entry: LogEntry = {
      id: Date.now().toString(),
      level,
      message,
      timestamp: new Date().toISOString(),
      details
    }
    this.logs.unshift(entry)
    if (this.logs.length > 100) this.logs.pop()
    this.notifyListeners()
  }

  info(message: string, details?: any) { this.log('INFO', message, details) }
  error(message: string, details?: any) { this.log('ERROR', message, details) }
  success(message: string, details?: any) { this.log('SUCCESS', message, details) }

  subscribe(callback: (logs: LogEntry[]) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.logs]))
  }
}

const logger = new Logger()

export default function Dashboard() {
  const [optionsData, setOptionsData] = useState<OptionsFlow[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLive, setIsLive] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  // Environment variables display
  const envStatus = {
    hasEmail: typeof process.env.NEXT_PUBLIC_UW_EMAIL !== 'undefined',
    hasPassword: typeof process.env.NEXT_PUBLIC_UW_PASSWORD !== 'undefined',
    nodeEnv: process.env.NODE_ENV || 'development'
  }

  // Subscribe to logger
  useEffect(() => {
    const unsubscribe = logger.subscribe(setLogs)
    logger.info('Dashboard initialized')
    return unsubscribe
  }, [])

  // Simulate real-time data updates
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isLive) {
      interval = setInterval(() => {
        try {
          const newData = generateRealtimeData()
          setOptionsData(prev => [...newData, ...prev].slice(0, 50))
          setLastUpdate(new Date().toLocaleTimeString())
          logger.success(`Updated with ${newData.length} new flows`)
        } catch (error) {
          logger.error('Failed to update data', error)
        }
      }, 3000) // Update every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isLive])

  // Generate realistic options flow data
  const generateRealtimeData = (): OptionsFlow[] => {
    const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'SPY', 'QQQ']
    const types: ('CALL' | 'PUT')[] = ['CALL', 'PUT']
    
    return Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => ({
      id: Date.now().toString() + Math.random(),
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      type: types[Math.floor(Math.random() * types.length)],
      strike: Math.floor(Math.random() * 200) + 100,
      volume: Math.floor(Math.random() * 5000) + 100,
      premium: Math.floor(Math.random() * 1000000) + 10000,
      timestamp: new Date().toISOString(),
      iv: Math.random() * 100 + 20
    }))
  }

  // Chart data processing
  const volumeChartData = optionsData.slice(0, 10).map(item => ({
    symbol: item.symbol,
    volume: item.volume,
    premium: item.premium / 1000
  }))

  const flowPieData = [
    { name: 'Calls', value: optionsData.filter(d => d.type === 'CALL').length, fill: '#22c55e' },
    { name: 'Puts', value: optionsData.filter(d => d.type === 'PUT').length, fill: '#ef4444' }
  ]

  const timeSeriesData = optionsData.slice(0, 20).reverse().map((item, index) => ({
    time: index,
    volume: item.volume,
    premium: item.premium / 1000
  }))

  const toggleLiveUpdates = () => {
    setIsLive(!isLive)
    if (!isLive) {
      logger.info('Live updates started')
    } else {
      logger.info('Live updates stopped')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Unusual Whales Live Dashboard</h1>
            <p className="text-gray-400">Last update: {lastUpdate || 'Never'}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded text-sm ${isLive ? 'bg-green-600' : 'bg-gray-600'}`}>
              {isLive ? 'LIVE' : 'STOPPED'}
            </div>
            <button
              onClick={toggleLiveUpdates}
              className={`px-4 py-2 rounded font-medium ${
                isLive 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isLive ? 'Stop Live Feed' : 'Start Live Feed'}
            </button>
          </div>
        </div>

        {/* Environment Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Environment Status</h3>
            <div className="space-y-1 text-sm">
              <div className={`flex items-center gap-2 ${envStatus.hasEmail ? 'text-green-400' : 'text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full ${envStatus.hasEmail ? 'bg-green-400' : 'bg-red-400'}`}></div>
                Email Config
              </div>
              <div className={`flex items-center gap-2 ${envStatus.hasPassword ? 'text-green-400' : 'text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full ${envStatus.hasPassword ? 'bg-green-400' : 'bg-red-400'}`}></div>
                Password Config
              </div>
              <div className="text-gray-300">
                Environment: {envStatus.nodeEnv}
              </div>
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Live Statistics</h3>
            <div className="space-y-1 text-sm">
              <div>Total Flows: {optionsData.length}</div>
              <div>Calls: {optionsData.filter(d => d.type === 'CALL').length}</div>
              <div>Puts: {optionsData.filter(d => d.type === 'PUT').length}</div>
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">System Logs</h3>
            <div className="space-y-1 text-sm">
              <div>Total: {logs.length}</div>
              <div className="text-red-400">Errors: {logs.filter(l => l.level === 'ERROR').length}</div>
              <div className="text-green-400">Success: {logs.filter(l => l.level === 'SUCCESS').length}</div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Volume Chart */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Volume by Symbol</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volumeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="symbol" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Bar dataKey="volume" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Call/Put Ratio */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Call/Put Flow Ratio</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={flowPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {flowPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Time Series */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Live Volume Timeline</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Line type="monotone" dataKey="volume" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-8">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold">Live Options Flow</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Symbol</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Strike</th>
                  <th className="px-4 py-3 text-left">Volume</th>
                  <th className="px-4 py-3 text-left">Premium</th>
                  <th className="px-4 py-3 text-left">IV</th>
                  <th className="px-4 py-3 text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {optionsData.slice(0, 10).map((flow) => (
                  <tr key={flow.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-medium text-blue-400">{flow.symbol}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        flow.type === 'CALL' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                      }`}>
                        {flow.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">${flow.strike}</td>
                    <td className="px-4 py-3">{flow.volume.toLocaleString()}</td>
                    <td className="px-4 py-3 text-green-400">{formatCurrency(flow.premium)}</td>
                    <td className="px-4 py-3">{flow.iv.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(flow.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Logging Panel */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold">System Logs</h3>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400">No logs yet...</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-sm">
                    <div className={`px-2 py-1 rounded text-xs ${
                      log.level === 'ERROR' ? 'bg-red-900 text-red-300' :
                      log.level === 'SUCCESS' ? 'bg-green-900 text-green-300' :
                      'bg-blue-900 text-blue-300'
                    }`}>
                      {log.level}
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-300">{log.message}</div>
                      <div className="text-gray-500 text-xs">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}