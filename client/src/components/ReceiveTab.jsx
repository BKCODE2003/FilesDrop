import React, { useState } from 'react'
import { Download, Search, AlertCircle, CheckCircle } from 'lucide-react'
import { formatFileSize } from '../utils/fileUtils'

const ReceiveTab = () => {
  const [shareCode, setShareCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [files, setFiles] = useState([])
  const [remainingDownloads, setRemainingDownloads] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleCodeSubmit = async (e) => {
    e.preventDefault()
    if (!shareCode.trim()) {
      setError('Please enter a share code')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/files/${shareCode.toUpperCase()}`)
      const data = await response.json()

      if (response.ok) {
        setFiles(data.files || [])
        // Initialize remaining downloads for each file
        const downloads = {}
        data.files.forEach(file => {
          downloads[file.id] = file.remainingDownloads || data.remainingDownloads
        })
        setRemainingDownloads(downloads)
        setSuccess(`Found ${data.files.length} file(s) ready for download`)
      } else {
        setError(data.error || 'Invalid or expired share code')
        setFiles([])
        setRemainingDownloads({})
      }
    } catch (error) {
      console.error('Network Error:', error)
      setError('Unable to connect. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadFile = async (fileId, fileName) => {
    try {
      const response = await fetch(`/api/files/${shareCode.toUpperCase()}/download/${fileId}`)

      if (response.ok) {
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(downloadUrl)
        document.body.removeChild(a)

        // Update remaining downloads for this specific file
        setRemainingDownloads(prev => {
          const newDownloads = { ...prev }
          if (newDownloads[fileId] > 1) {
            newDownloads[fileId] -= 1
          } else {
            // Remove file from list when no downloads remaining
            setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId))
            delete newDownloads[fileId]
          }
          return newDownloads
        })

        setSuccess(`${fileName} downloaded successfully`)
        setTimeout(() => setSuccess(''), 3000)

      } else {
        const data = await response.json()
        setError('Download failed: ' + data.error)
      }
    } catch (error) {
      console.error('Download error:', error)
      setError('Download failed. Please try again.')
    }
  }

  const getFileIcon = (type) => {
    if (type?.includes('image')) return '🖼️'
    if (type?.includes('video')) return '🎥'
    if (type?.includes('audio')) return '🎵'
    if (type?.includes('pdf')) return '📄'
    if (type?.includes('document') || type?.includes('word')) return '📝'
    return '📄'
  }

  const resetForm = () => {
    setShareCode('')
    setFiles([])
    setRemainingDownloads({})
    setError('')
    setSuccess('')
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Code Input */}
      <div className="card p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Enter share code
        </h3>
        <form onSubmit={handleCodeSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={shareCode}
              onChange={(e) => setShareCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-digit code"
              className="input-field text-center text-lg font-mono"
              maxLength={6}
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter the 6-digit code you received from the sender
            </p>
          </div>
          <button
            type="submit"
            disabled={isLoading || !shareCode.trim()}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Search className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Find files
              </>
            )}
          </button>
        </form>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">
              Available files ({files.length})
            </h4>
            <button
              onClick={resetForm}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Enter different code
            </button>
          </div>

          <div className="space-y-3">
            {files.map((file, index) => (
              <div key={file.id || index} className="file-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileIcon(file.type)}</span>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <div className="text-sm text-gray-500 space-x-2">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{remainingDownloads[file.id] || 0} downloads left</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadFile(file.id, file.name)}
                    className="btn-primary"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-amber-600 mr-3" />
              <p className="text-amber-800 text-sm">
                <strong>Note:</strong> Files will be automatically deleted after 30 minutes 
                or when all downloads are used.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !files.length && !error && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Enter a share code
          </h4>
          <p className="text-gray-500">
            Get the 6-digit code from the person sharing files with you
          </p>
        </div>
      )}
    </div>
  )
}

export default ReceiveTab
