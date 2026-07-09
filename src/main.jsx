import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initAnalytics } from './utils/analyticsEvents'

initAnalytics()

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
