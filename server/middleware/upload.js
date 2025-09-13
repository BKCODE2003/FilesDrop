import multer from 'multer'
import path from 'path'
import fs from 'fs'

const uploadsDir = 'uploads/temp'

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log('📁 Created uploads directory')
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const extension = path.extname(file.originalname)
    const filename = `${uniqueSuffix}${extension}`
    cb(null, filename)
  }
})

export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB per file
    files: 10 // Maximum 10 files per upload
  }
})

export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('Upload error:', error)

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ 
          error: 'File too large. Maximum size is 100MB per file.'
        })
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ 
          error: 'Too many files. Maximum 10 files per upload.'
        })
      default:
        return res.status(400).json({ 
          error: `Upload error: ${error.message}`
        })
    }
  }

  next(error)
}
