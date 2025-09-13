import { useState, useCallback } from 'react'

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)

  const uploadFiles = useCallback(async (filesWithLimits) => {
    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const formData = new FormData()

      filesWithLimits.forEach((fileData) => {
        formData.append('files', fileData.file)
        formData.append('downloadLimits', fileData.downloadLimit)
      })

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setUploadProgress(100)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsUploading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setIsUploading(false)
    setUploadProgress(0)
    setError(null)
  }, [])

  return {
    uploadFiles,
    isUploading,
    uploadProgress,
    error,
    reset
  }
}
