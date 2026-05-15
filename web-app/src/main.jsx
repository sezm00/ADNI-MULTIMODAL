import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import IntroScreen from './pages/IntroScreen.jsx'
import Login from './pages/Login.jsx'
import DoctorManagement from './pages/DoctorManagement.jsx'
import PatientDashboard from './pages/PatientDashboard.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"                  element={<IntroScreen />} />
        <Route path="/login"             element={<Login />} />
        <Route path="/doctor-management" element={<DoctorManagement />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="*"                  element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
