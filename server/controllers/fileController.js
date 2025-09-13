import path from 'path'
import fs from 'fs/promises'
import FileShare from '../models/FileShare.js'

export const uploadFiles = async (req, res) => {
  try {
    console.log('📤 Upload request received')

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    const downloadLimitsArray = Array.isArray(req.body.downloadLimits) 
      ? req.body.downloadLimits 
      : [req.body.downloadLimits]

    const shareCode = await FileShare.generateUniqueCode()
    console.log('Generated code:', shareCode)

    const fileData = req.files.map((file, index) => {
      const downloadLimit = parseInt(downloadLimitsArray[index]) || 1
      const validLimit = Math.min(50, Math.max(1, downloadLimit))

      return {
        originalName: file.originalname,
        fileName: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        downloadLimit: validLimit,
        remainingDownloads: validLimit,
        downloadLogs: []
      }
    })

    const fileShare = new FileShare({
      shareCode,
      files: fileData
    })

    await fileShare.save()
    console.log('✅ Files saved with code:', shareCode)

    res.status(201).json({
      shareCode,
      fileCount: fileData.length,
      totalSize: fileShare.totalSize,
      expiresIn: '30 minutes'
    })

  } catch (error) {
    console.error('Upload error:', error)

    if (req.files) {
      req.files.forEach(async (file) => {
        try {
          await fs.unlink(file.path)
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError)
        }
      })
    }

    res.status(500).json({ 
      error: `Upload failed: ${error.message}`
    })
  }
}

export const getFilesByCode = async (req, res) => {
  try {
    const { code } = req.params

    if (!code || code.length !== 6) {
      return res.status(400).json({ error: 'Share code must be 6 characters' })
    }

    const fileShare = await FileShare.findByCode(code)

    if (!fileShare) {
      return res.status(404).json({ error: 'Invalid or expired share code' })
    }

    if (!fileShare.hasAvailableDownloads()) {
      return res.status(410).json({ error: 'All download limits exceeded' })
    }

    const availableFiles = fileShare.files.filter(file => file.remainingDownloads > 0)

    const response = {
      shareCode: fileShare.shareCode,
      files: availableFiles.map(file => ({
        name: file.originalName,
        size: file.size,
        type: file.mimetype,
        id: file._id,
        downloadLimit: file.downloadLimit,
        remainingDownloads: file.remainingDownloads
      })),
      totalSize: fileShare.totalSize
    }

    res.json(response)

  } catch (error) {
    console.error('Get files error:', error)
    res.status(500).json({ 
      error: `Failed to retrieve files: ${error.message}`
    })
  }
}

export const downloadFile = async (req, res) => {
  try {
    const { code, fileId } = req.params

    const fileShare = await FileShare.findByCode(code)

    if (!fileShare) {
      return res.status(404).json({ error: 'Invalid or expired share code' })
    }

    const file = fileShare.getFileById(fileId)

    if (!file) {
      return res.status(404).json({ error: 'File not found' })
    }

    if (file.remainingDownloads <= 0) {
      return res.status(410).json({ error: 'Download limit exceeded for this file' })
    }

    try {
      await fs.access(file.path)
    } catch (accessError) {
      return res.status(404).json({ error: 'File no longer available' })
    }

    await fileShare.recordFileDownload(
      fileId,
      req.ip,
      req.get('User-Agent')
    )

    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`)
    res.setHeader('Content-Type', file.mimetype)
    res.setHeader('Content-Length', file.size)

    const fileBuffer = await fs.readFile(file.path)
    console.log('✅ File downloaded:', file.originalName)
    res.send(fileBuffer)

  } catch (error) {
    console.error('Download error:', error)
    res.status(500).json({ 
      error: `Download failed: ${error.message}`
    })
  }
}
