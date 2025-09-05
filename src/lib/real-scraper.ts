// src/lib/real-scraper.ts

import puppeteer from 'puppeteer'

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

export class RealUnusualWhalesScraper {
  private browser: any = null
  private page: any = null
  private isLoggedIn = false

  constructor(
    private email: string,
    private password: string
  ) {}

  async initialize() {
    try {
      console.log('🚀 Launching browser...')
      
      this.browser = await puppeteer.launch({
        headless: false, // Set to true for production
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      })

      this.page = await this.browser.newPage()
      
      // Set realistic user agent
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      )
      
      await this.page.setViewport({ width: 1920, height: 1080 })
      
      console.log('✅ Browser initialized')
      return true
    } catch (error) {
      console.error('❌ Browser initialization failed:', error)
      return false
    }
  }

  async login() {
    try {
      console.log('🔑 Navigating to Unusual Whales login...')
      
      await this.page.goto('https://unusualwhales.com/login', {
        waitUntil: 'networkidle2',
        timeout: 30000
      })

      console.log('📝 Filling login form...')
      
      // Wait for and fill email
      await this.page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 })
      await this.page.type('input[type="email"], input[name="email"]', this.email, { delay: 100 })
      
      // Wait for and fill password
      await this.page.waitForSelector('input[type="password"], input[name="password"]', { timeout: 5000 })
      await this.page.type('input[type="password"], input[name="password"]', this.password, { delay: 100 })
      
      console.log('🔐 Submitting login...')
      
      // Click login button
      await this.page.click('button[type="submit"], .login-btn, .btn-primary')
      
      // Wait for navigation
      await this.page.waitForNavigation({ 
        waitUntil: 'networkidle2', 
        timeout: 15000 
      })
      
      // Check if login was successful
      const currentUrl = this.page.url()
      this.isLoggedIn = !currentUrl.includes('/login') && !currentUrl.includes('/signin')
      
      if (this.isLoggedIn) {
        console.log('✅ Login successful!')
      } else {
        console.log('❌ Login failed - still on login page')
      }
      
      return this.isLoggedIn
    } catch (error) {
      console.error('❌ Login error:', error)
      return false
    }
  }

  async scrapeOptionsFlow(): Promise<RealActivity[]> {
    try {
      console.log('📊 Navigating to options flow...')
      
      // Navigate to the flow page
      await this.page.goto('https://unusualwhales.com/flow', {
        waitUntil: 'networkidle2',
        timeout: 30000
      })

      console.log('⏳ Waiting for data to load...')
      
      // Wait for the data table to load
      await this.page.waitForSelector('table, .flow-table, [data-testid*="table"]', { 
        timeout: 20000 
      })

      // Additional wait for dynamic content
      await this.page.waitForTimeout(3000)

      console.log('🔍 Extracting options flow data...')

      const activities = await this.page.evaluate(() => {
        const rows = document.querySelectorAll('tr:not(thead tr), .flow-row, [data-testid*="row"]')
        const data: any[] = []

        rows.forEach((row: any, index: number) => {
          try {
            const cells = row.querySelectorAll('td, .cell, .flow-cell')
            
            if (cells.length >= 6) {
              // Extract data from table cells
              const symbolCell = cells[0]?.textContent?.trim() || ''
              const typeCell = cells[1]?.textContent?.trim() || ''
              const strikeCell = cells[2]?.textContent?.trim() || ''
              const expirationCell = cells[3]?.textContent?.trim() || ''
              const volumeCell = cells[4]?.textContent?.trim() || ''
              const premiumCell = cells[5]?.textContent?.trim() || ''
              
              // Additional cells if available
              const spotPriceCell = cells[6]?.textContent?.trim() || ''
              const oiCell = cells[7]?.textContent?.trim() || ''
              const ivCell = cells[8]?.textContent?.trim() || ''

              // Clean and parse the data
              const symbol = symbolCell.replace(/[^A-Z]/g, '').substring(0, 10)
              const type = typeCell.toLowerCase()
              const strike = parseFloat(strikeCell.replace(/[^\d.]/g, '')) || 0
              const volume = parseInt(volumeCell.replace(/[^\d]/g, '')) || 0
              const premium = parseFloat(premiumCell.replace(/[^\d.]/g, '')) || 0
              const spotPrice = parseFloat(spotPriceCell.replace(/[^\d.]/g, '')) || 0
              const openInterest = parseInt(oiCell.replace(/[^\d]/g, '')) || 0
              const iv = parseFloat(ivCell.replace(/[^\d.]/g, '')) || 0

              // Only include valid entries
              if (symbol && volume > 0 && premium > 0) {
                data.push({
                  id: `real-${symbol}-${Date.now()}-${index}`,
                  symbol,
                  type: type.includes('call') ? 'CALL' : type.includes('put') ? 'PUT' : 'SWEEP',
                  strike,
                  expiration: expirationCell || 'N/A',
                  volume,
                  premium,
                  timestamp: new Date().toISOString(),
                  spotPrice,
                  openInterest,
                  iv
                })
              }
            }
          } catch (err) {
            console.warn('Error parsing row:', err)
          }
        })

        return data
      })

      console.log(`✅ Extracted ${activities.length} real activities`)
      return activities

    } catch (error) {
      console.error('❌ Scraping error:', error)
      return []
    }
  }

  async scrapeAll() {
    try {
      // Initialize browser
      const initSuccess = await this.initialize()
      if (!initSuccess) {
        throw new Error('Failed to initialize browser')
      }

      // Login
      const loginSuccess = await this.login()
      if (!loginSuccess) {
        throw new Error('Failed to login')
      }

      // Scrape data
      const activities = await this.scrapeOptionsFlow()

      return {
        success: true,
        data: activities,
        timestamp: new Date().toISOString(),
        count: activities.length
      }

    } catch (error) {
      console.error('❌ Scraping failed:', error)
      return {
        success: false,
        data: [],
        timestamp: new Date().toISOString(),
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async cleanup() {
    try {
      if (this.page) {
        await this.page.close()
      }
      if (this.browser) {
        await this.browser.close()
      }
      console.log('🧹 Browser cleanup completed')
    } catch (error) {
      console.error('❌ Cleanup error:', error)
    }
  }
}