import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MerchantProvider } from './context/MerchantContext.jsx'
import App from './App.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <MerchantProvider>
        <App />
      </MerchantProvider>
    </BrowserRouter>
  </React.StrictMode>
)
