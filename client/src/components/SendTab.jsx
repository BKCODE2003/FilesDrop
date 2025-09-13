import React, { useState, useRef } from 'react'
import { Upload, X, Copy, Plus, Minus, FileText } from 'lucide-react'
import { formatFileSize } from '../utils/fileUtils'

const SendTab = () => {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('') // Persistent until cleared
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef()

  const handleFilesSelected = (files) => {
    const newFiles = Array.from(files).map(file => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      downloadLimit: 1 // Default 1 download per file
    }))
    setSelectedFiles(prev => [...prev, ...newFiles])
  }

  const updateFileDownloadLimit = (fileId, newLimit) => {
    const limit = Math.min(50, Math.max(1, parseInt(newLimit) || 1))
    setSelectedFiles(prev => 
      prev.map(f => f.id === fileId ? { ...f, downloadLimit: limit } : f)
    )
  }

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFilesSelected(files)
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one file')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      selectedFiles.forEach(fileData => {
        formData.append('files', fileData.file)
        formData.append('downloadLimits', fileData.downloadLimit)
      })

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setGeneratedCode(data.shareCode) // Set persistent code
        setSelectedFiles([])
      } else {
        alert('Upload failed: ' + data.error)
      }

    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode)
      alert('Code copied to clipboard!')
    } catch (error) {
      const textArea = document.createElement('textarea')
      textArea.value = generatedCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Code copied to clipboard!')
    }
  }

  const clearCode = () => {
    setGeneratedCode('')
  }

  const startOver = () => {
    setSelectedFiles([])
    setGeneratedCode('')
  }

  const getFileIcon = (type) => {
    if (type.includes('image')) return '🖼️'
    if (type.includes('video')) return '🎥'
    if (type.includes('audio')) return '🎵'
    if (type.includes('pdf')) return '📄'
    if (type.includes('document') || type.includes('word')) return '📝'
    return '📄'
  }

  return (
    <div className="max-w-4xl mx-auto">
      {generatedCode ? (
        /* Success State */
        <div className="text-center">
          <div className="card p-8 mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Files ready to share
            </h3>
            <p className="text-gray-600 mb-6">
              Share this code with anyone who needs access to your files:
            </p>
            <div className="code-display mb-6">
              {generatedCode}
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={copyToClipboard}
                className="btn-primary"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy code
              </button>
              <button
                onClick={clearCode}
                className="btn-secondary"
              >
                Clear
              </button>
              <button
                onClick={startOver}
                className="btn-secondary"
              >
                Send more files
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Files will automatically expire in 30 minutes or when download limits are reached
          </p>
        </div>
      ) : (
        /* Upload State */
        <>
          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`drag-zone mb-6 ${isDragOver ? 'drag-over' : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
            />

            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isDragOver ? 'Drop files here' : 'Choose files to upload'}
            </h3>
            <p className="text-gray-500 mb-2">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-sm text-gray-400">
              Supports any file type • Up to 100MB per file • Maximum 10 files
            </p>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Selected files ({selectedFiles.length})
              </h4>
              <div className="space-y-3">
                {selectedFiles.map((fileData) => (
                  <div key={fileData.id} className="file-item">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getFileIcon(fileData.type)}</span>
                        <div>
                          <p className="font-medium text-gray-900">{fileData.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(fileData.size)}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {/* Download limit controls */}
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-600">Downloads:</label>
                          <button
                            onClick={() => updateFileDownloadLimit(fileData.id, fileData.downloadLimit - 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                            disabled={fileData.downloadLimit <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-medium text-gray-900">
                            {fileData.downloadLimit}
                          </span>
                          <button
                            onClick={() => updateFileDownloadLimit(fileData.id, fileData.downloadLimit + 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                            disabled={fileData.downloadLimit >= 50}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFile(fileData.id)}
                          className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Generate share code'}
          </button>
        </>
      )}
    </div>
  )
}

export default SendTab
