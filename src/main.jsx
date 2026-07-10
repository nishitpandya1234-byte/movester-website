import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import SalesHelper from './pages/SalesHelper'
import Calculator from './pages/Calculator'
import Attendance from './pages/Attendance'
import './index.css'

const path = window.location.pathname

function Root() {
  if (path === '/team/sales-helper') return <SalesHelper />
  if (path === '/team/calculator') return <Calculator internal />
  if (path === '/calculator') return <Calculator />
  if (path === '/attendance') return <Attendance />
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
