import React from 'react'
import { Upload, Shield, Clock, ArrowRight } from 'lucide-react'

const LandingPage = ({ onNavigateToProduct }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Upload className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">FileDrop</span>
            </div>
            <button
              onClick={onNavigateToProduct}
              className="btn-primary"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 sm:pt-24 sm:pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Share files instantly
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Send files up to 100MB to anyone with a simple 6-digit code. 
            No accounts, no hassle. Files are automatically deleted after 30 minutes.
          </p>
          <button
            onClick={onNavigateToProduct}
            className="inline-flex items-center btn-primary text-lg px-8 py-3"
          >
            Start sharing
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Simple & Hassle-Free file sharing
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Easy to use
              </h3>
              <p className="text-gray-600">
                Drag and drop your files, set download limits, and get a secure code to share.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Easy and Secure Access
              </h3>
              <p className="text-gray-600">
                Access all the files just with one code.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Automatically expires
              </h3>
              <p className="text-gray-600">
                Set custom download limits and files expire automatically for security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to share?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Start sharing files in seconds.
          </p>
          <button
            onClick={onNavigateToProduct}
            className="btn-primary text-lg px-8 py-3"
          >
            Start now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">
            &copy; 2025 FileDrop. Instant file sharing made simple.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
