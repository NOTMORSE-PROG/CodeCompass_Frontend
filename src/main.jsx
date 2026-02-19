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
      toastOptions={{
        style: {
          background: '#1A1A1A',
          color: '#FFC300',
          border: '1px solid #FFC300',
          fontFamily: 'Inter, sans-serif',
        },
        success: {
          iconTheme: { primary: '#FFC300', secondary: '#0A0A0A' },
        },
      }}
    />
  </React.StrictMode>,
)
