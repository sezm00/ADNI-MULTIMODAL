import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import App from './App.jsx'
import DoctorManagement from './pages/DoctorManagement.jsx'
import AIDiagnosis from './pages/AIDiagnosis.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/patient-dashboard" element={<App />} />
        <Route path="/ai-diagnosis" element={<AIDiagnosis />} />
        <Route path="/doctor-management" element={<DoctorManagement />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
