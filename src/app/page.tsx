export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Unusual Whales Scraper</h1>
        <p className="text-gray-400 mb-8">Real-time options flow dashboard</p>
        <a 
          href="/dashboard" 
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
        >
          Launch Dashboard
        </a>
      </div>
    </div>
  )
}