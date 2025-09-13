import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import helmet from 'helmet'
import cron from 'node-cron'

import fileRoutes from './routes/files.js'
import { cleanupExpiredFiles } from './utils/cleanup.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001
const MONGODB_URI = process.env.MONGODB_URI

console.log('🚀 Starting FileDrop server...')

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: PORT,
    fileRetention: '30 minutes'
  })
})

// Routes
app.use('/api/files', fileRoutes)

// Error handling
app.use((error, req, res, next) => {
  console.error('Server Error:', error)

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      error: 'File too large. Maximum size is 100MB per file.' 
    })
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ 
      error: 'Too many files. Maximum 10 files per upload.' 
    })
  }

  res.status(500).json({ 
    error: 'Internal server error'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Database connection
console.log('Connecting to MongoDB...')
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB')
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  })

// Cleanup job - runs every 10 minutes
cron.schedule('*/10 * * * *', () => {
  console.log('🧹 Running file cleanup...')
  cleanupExpiredFiles()
})

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`)
  console.log(`📱 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`)
})

export default app
