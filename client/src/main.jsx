import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 3500,
        style: {
          background: '#131929',
          color: '#f1f5f9',
          border: '1px solid #1e2d45',
          borderRadius: '12px',
          fontSize: '13px',
          padding: '10px 14px',
        },
        success: {
          iconTheme: { primary: '#10b981', secondary: '#131929' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#131929' },
        },
      }}
    />
  </React.StrictMode>
)
