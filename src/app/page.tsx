'use client'

import { useState } from 'react'

export default function Dashboard() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const scrape = async () => {
    setLoading(true)
    // Simple mock data - no external files needed
    setTimeout(() => {
      setData([
        { symbol: 'AAPL', type: 'CALL', volume: 1500, premium: 250000 },
        { symbol: 'MSFT', type: 'PUT', volume: 2000, premium: 180000 },
        { symbol: 'GOOGL', type: 'SWEEP', volume: 800, premium: 420000 }
      ])
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-8">🐋 Dashboard</h1>
      
      <button 
        onClick={scrape}
        disabled={loading}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded mb-8"
      >
        {loading ? 'Scraping...' : 'Start Scraping'}
      </button>

      <div className="grid gap-4">
        {data.map((item, i) => (
          <div key={i} className="p-4 bg-gray-800 rounded border">
            <div className="flex justify-between">
              <span className="font-bold">{item.symbol}</span>
              <span className={item.type === 'CALL' ? 'text-green-400' : 'text-red-400'}>
                {item.type}
              </span>
            </div>
            <div className="text-gray-400">
              Volume: {item.volume.toLocaleString()} | Premium: ${item.premium.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}