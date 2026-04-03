import { Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthOption from './pages/AuthOption';
import Dashboard from './pages/Dashboard';
import SetupProfile from './pages/SetupProfile';

// 1. Import cái chốt chặn vừa tạo
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="font-sans text-gray-800 bg-slate-50 min-h-screen">
      <Routes>
        {/* NHỮNG TRANG MỞ CỬA TỰ DO (Ai vào cũng được) */}
        <Route path="/" element={<Welcome />} />
        <Route path="/auth-options" element={<AuthOption />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* NHỮNG TRANG BỊ KHÓA (Phải có Token mới được vào) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/setup-profile" 
          element={
            <ProtectedRoute>
              <SetupProfile />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;