import fs from 'fs/promises'
import FileShare from '../models/FileShare.js'

export const cleanupExpiredFiles = async () => {
  try {
    // Find expired file shares
    const expiredShares = await FileShare.find({
      $or: [
        { remainingDownloads: 0 },
        { createdAt: { $lt: new Date(Date.now() - 30 * 60 * 1000) } }
      ]
    })

    let deletedFiles = 0
    let deletedShares = 0

    for (const share of expiredShares) {
      try {
        // Delete physical files
        for (const file of share.files) {
          try {
            await fs.access(file.path)
            await fs.unlink(file.path)
            deletedFiles++
          } catch (unlinkError) {
            // File already doesn't exist
          }
        }

        // Delete database record
        await FileShare.findByIdAndDelete(share._id)
        deletedShares++

      } catch (shareError) {
        console.error(`Error processing share ${share.shareCode}:`, shareError.message)
      }
    }

    if (deletedShares > 0) {
      console.log(`✅ Cleanup: ${deletedFiles} files, ${deletedShares} shares removed`)
    }

  } catch (error) {
    console.error('Cleanup error:', error)
  }
}
