import express from 'express'
import { 
  uploadFiles, 
  getFilesByCode, 
  downloadFile
} from '../controllers/fileController.js'
import { upload, handleUploadError } from '../middleware/upload.js'

const router = express.Router()

// Upload files with individual download limits
router.post('/upload', 
  upload.array('files', 10), 
  handleUploadError,
  uploadFiles
)

// Get files by share code
router.get('/:code', getFilesByCode)

// Download specific file
router.get('/:code/download/:fileId', downloadFile)

export default router
