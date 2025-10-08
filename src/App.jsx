import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import './App.css'
import LandingPage from './pages/LandingPage'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Filing from './pages/Filing'
import Processing from './pages/Processing'
import Chat from './pages/Chat'
import Summary from './pages/Summary'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/filing" element={<Filing />} />
          <Route path="/processing" element={<Processing />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/summary" element={<Summary />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
