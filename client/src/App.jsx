import React, { useState } from 'react'
import LandingPage from './components/LandingPage'
import ProductPage from './components/ProductPage'

function App() {
  const [currentPage, setCurrentPage] = useState('landing')

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'landing' ? (
        <LandingPage onNavigateToProduct={() => setCurrentPage('product')} />
      ) : (
        <ProductPage onNavigateToLanding={() => setCurrentPage('landing')} />
      )}
    </div>
  )
}

export default App
