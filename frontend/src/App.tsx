import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';


import './index.css'
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import MessagingPage from './pages/MessagingPage';
import MessagingListPage from './pages/MessagingListPage';
import MomentsPage from './pages/MomentsPage';
import CameraPage from './pages/CameraPage';
import FriendPage from './pages/FriendPage';
import AIChat from './pages/AIChat';
import VerifyEmailPage from './pages/VerifyEmailPage';


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/register" element={<SignUpPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} /> 
        <Route path="/messaging" element={<MessagingPage />} />
        <Route path="/messaginglist" element={<MessagingListPage />} />
        <Route path="/moments" element={<MomentsPage />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/friends" element={<FriendPage />} />
        <Route path="/aichat" element={<AIChat />} />
        <Route path="/verify/:token" element={<VerifyEmailPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App
