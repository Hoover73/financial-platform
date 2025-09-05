'use client'

import { useState } from 'react'

interface RealActivity {
  id: string
  symbol: string
  type: string
  strike: number
  expiration: string
  volume: number
  premium: number
  timestamp: string
  spotPrice: number
  openInterest: number
  iv: number
}

export default function RealDashboard() {
  const [activities, setActivities] = useState<RealActivity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastScrape, setLastScrape] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scrapingStatus, setScrapingStatus] = useState<string>('Ready')

  const startRealScraping = async () => {
    setIsLoading(true)
    setError(null)
    setScrapingStatus('Initializing browser...')
    
    try {
      console.log('🚀 Starting real scraping...')
      
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (result.success) {
        setActivities(result.data)
        setLastScrape(result.timestamp)
        setScrapingStatus(`Success! Found ${result.count} activities`)
        console.log('✅ Real scraping completed:', result)
      } else {
        setError(result.error || 'Real scraping failed')
        setScrapingStatus('Failed')
      }
    } catch (err) {
      setError('Network error occurred')
      setScrapingStatus('Network Error')
      console.error('Real scraping error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleString()
  }

  const getTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'CALL': return 'bg-green-900 text-green-300'
      case 'PUT': return 'bg-red-900 text-red-300'
      case 'SWEEP': return 'bg-blue-900 text-blue-300'
      default: return 'bg-gray-900 text-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🐋 Real Unusual Whales Scraper</h1>
          <p className="text-gray-400">Live browser automation scraping from unusualwhales.com</p>
        </div>

        {/* Status Panel */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Real-Time Scraping Status</h2>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                isLoading ? 'bg-blue-400 animate-pulse' :
                error ? 'bg-red-400' :
                activities.length > 0 ? 'bg-green-400' : 'bg-gray-400'
              }`} />
              <span className="text-sm font-medium">{scrapingStatus}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-3 bg-gray-700/50 rounded">
              <p className="text-sm text-gray-400">Last Real Scrape</p>
              <p className="font-medium">{formatTime(lastScrape)}</p>
            </div>
            <div className="p-3 bg-gray-700/50 rounded">
              <p className="text-sm text-gray-400">Live Activities</p>
              <p className="font-medium text-green-400">{activities.length}</p>
            </div>
            <div className="p-3 bg-gray-700/50 rounded">
              <p className="text-sm text-gray-400">Total Volume</p>
              <p className="font-medium">
                {activities.reduce((sum, a) => sum + a.volume, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-gray-700/50 rounded">
              <p className="text-sm text-gray-400">Total Premium</p>
              <p className="font-medium">
                {formatCurrency(activities.reduce((sum, a) => sum + a.premium, 0))}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-600 rounded text-red-300">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={startRealScraping}
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? '🤖 Real Scraping in Progress...' : '🐋 Start Real Scraping'}
            </button>
            
            <button
              onClick={() => {
                setActivities([])
                setError(null)
                setScrapingStatus('Ready')
              }}
              className="px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium"
            >
              Clear Data
            </button>
          </div>
        </div>

        {/* Live Data Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Live Unusual Whales Data</h2>
            <span className="text-sm text-gray-400">
              Source: unusualwhales.com (Live Browser)
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Symbol</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Strike</th>
                  <th className="px-4 py-3 text-left">Spot Price</th>
                  <th className="px-4 py-3 text-left">Volume</th>
                  <th className="px-4 py-3 text-left">OI</th>
                  <th className="px-4 py-3 text-left">Premium</th>
                  <th className="px-4 py-3 text-left">IV</th>
                  <th className="px-4 py-3 text-left">Expiration</th>
                  <th className="px-4 py-3 text-left">Scraped At</th>
                </tr>
              </thead>
              <tbody>
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                      {isLoading ? (
                        <div>
                          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                          <p>Real scraping in progress... This may take 30-60 seconds</p>
                        </div>
                      ) : (
                        <div>
                          <p className="mb-2">No real data yet. Click "Start Real Scraping" to begin.</p>
                          <p className="text-sm">⚠️ Requires valid Unusual Whales credentials in .env.local</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  activities.map((activity) => (
                    <tr key={activity.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="px-4 py-3 font-bold text-blue-400">{activity.symbol}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(activity.type)}`}>
                          {activity.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">${activity.strike}</td>
                      <td className="px-4 py-3">${activity.spotPrice || 'N/A'}</td>
                      <td className="px-4 py-3 font-medium">{activity.volume.toLocaleString()}</td>
                      <td className="px-4 py-3">{activity.openInterest?.toLocaleString() || 'N/A'}</td>
                      <td className="px-4 py-3 text-green-400 font-medium">
                        {formatCurrency(activity.premium)}
                      </td>
                      <td className="px-4 py-3">{activity.iv ? `${activity.iv}%` : 'N/A'}</td>
                      <td className="px-4 py-3">{activity.expiration}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
          <h3 className="font-semibold text-yellow-400 mb-2">Setup Instructions:</h3>
          <ol className="text-sm text-yellow-200 space-y-1">
            <li>1. Create a <code>.env.local</code> file in your project root</li>
            <li>2. Add: <code>UNUSUAL_WHALES_EMAIL=your_email@example.com</code></li>
            <li>3. Add: <code>UNUSUAL_WHALES_PASSWORD=your_password</code></li>
            <li>4. Make sure you have a valid Unusual Whales premium subscription</li>
            <li>5. Click "Start Real Scraping" to begin live data extraction</li>
          </ol>
        </div>
      </div>
    </div>
  )
}