// src/app/api/scrape/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { RealUnusualWhalesScraper } from '../../../lib/real-scraper'

export const maxDuration = 60 // 60 seconds timeout for Vercel

export async function POST(request: NextRequest) {
  let scraper: RealUnusualWhalesScraper | null = null
  
  try {
    console.log('🚀 Starting REAL scraping on Vercel...')
    
    // Get credentials from environment variables
    const email = process.env.UNUSUAL_WHALES_EMAIL
    const password = process.env.UNUSUAL_WHALES_PASSWORD

    if (!email || !password) {
      console.error('Missing credentials')
      return NextResponse.json(
        { 
          error: 'Missing credentials. Please set UNUSUAL_WHALES_EMAIL and UNUSUAL_WHALES_PASSWORD in Vercel environment variables',
          success: false
        },
        { status: 400 }
      )
    }

    console.log('✅ Credentials found, initializing scraper...')

    // Initialize real scraper
    scraper = new RealUnusualWhalesScraper(email, password)
    
    // Perform real scraping with timeout
    const result = await Promise.race([
      scraper.scrapeAll(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Scraping timeout after 50 seconds')), 50000)
      )
    ]) as any

    if (!result.success) {
      console.error('Scraping failed:', result.error)
      return NextResponse.json(
        { 
          error: result.error || 'Real scraping failed',
          success: false,
          timestamp: result.timestamp
        },
        { status: 500 }
      )
    }

    console.log(`✅ REAL scraping completed: ${result.count} activities found`)

    return NextResponse.json({
      success: true,
      message: `Real scraping completed: ${result.count} live activities extracted`,
      data: result.data,
      timestamp: result.timestamp,
      count: result.count,
      source: 'Unusual Whales - Live Production Data',
      environment: 'Vercel Production'
    })

  } catch (error) {
    console.error('❌ Real scraping API error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false,
        timestamp: new Date().toISOString(),
        environment: 'Vercel Production'
      },
      { status: 500 }
    )
  } finally {
    // Always cleanup browser
    if (scraper) {
      console.log('🧹 Cleaning up browser...')
      await scraper.cleanup()
    }
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Real Unusual Whales Scraper API',
    status: 'active',
    version: '2.0 - Real Scraping',
    endpoints: {
      'POST /api/scrape': 'Trigger real scraping with browser automation'
    },
    requirements: [
      'UNUSUAL_WHALES_EMAIL environment variable',
      'UNUSUAL_WHALES_PASSWORD environment variable',
      'Valid Unusual Whales premium subscription'
    ]
  })
}