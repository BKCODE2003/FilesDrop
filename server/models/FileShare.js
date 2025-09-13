import mongoose from 'mongoose'

const fileShareSchema = new mongoose.Schema({
  shareCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    length: 6
  },
  files: [{
    originalName: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true,
      min: 0
    },
    path: {
      type: String,
      required: true
    },
    downloadLimit: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
      default: 1
    },
    remainingDownloads: {
      type: Number,
      required: true,
      min: 0
    },
    downloadLogs: [{
      downloadedAt: {
        type: Date,
        default: Date.now
      },
      ipAddress: String,
      userAgent: String
    }]
  }],
  totalSize: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 1800 // 30 minutes
  }
}, {
  timestamps: true
})

// Pre-save middleware
fileShareSchema.pre('save', function(next) {
  if (this.files && this.files.length > 0) {
    this.totalSize = this.files.reduce((total, file) => total + file.size, 0)
  }
  next()
})

// Instance methods
fileShareSchema.methods.hasAvailableDownloads = function() {
  return this.files.some(file => file.remainingDownloads > 0)
}

fileShareSchema.methods.getFileById = function(fileId) {
  return this.files.id(fileId)
}

fileShareSchema.methods.recordFileDownload = function(fileId, ipAddress, userAgent) {
  const file = this.files.id(fileId)
  if (!file || file.remainingDownloads <= 0) {
    throw new Error('File not available for download')
  }

  file.downloadLogs.push({
    downloadedAt: new Date(),
    ipAddress,
    userAgent
  })

  file.remainingDownloads = Math.max(0, file.remainingDownloads - 1)

  return this.save()
}

// Static methods
fileShareSchema.statics.findByCode = function(shareCode) {
  return this.findOne({ shareCode: shareCode.toUpperCase() })
}

fileShareSchema.statics.generateUniqueCode = async function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let attempts = 0
  const maxAttempts = 100

  while (attempts < maxAttempts) {
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length))
    }

    const existing = await this.findOne({ shareCode: code })
    if (!existing) {
      return code
    }

    attempts++
  }

  throw new Error('Unable to generate unique code')
}

const FileShare = mongoose.model('FileShare', fileShareSchema)

export default FileShare
