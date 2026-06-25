import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import './App.css'
import ProtectedRoute from './components/ProtectedRoute'
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
  )
}

export default App
