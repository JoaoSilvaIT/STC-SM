import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { AuthProvider} from './context/AuthContext'
import Login from './pages/Login'
import './App.css'
import ProtectedRoute from './components/ProtectedRoute'
import NotFound from "../../web/src/pages/NotFound.tsx";
import Simulator from "./components/Simulator"

function App() {
  return (
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                  <Simulator />
                </ProtectedRoute>
            }
            >
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
  )
}

export default App
