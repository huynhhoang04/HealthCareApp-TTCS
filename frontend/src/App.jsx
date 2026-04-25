import { Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthOption from './pages/AuthOption';
import Dashboard from './pages/Dashboard';
import SetupProfile from './pages/SetupProfile';
import AddNutrition from './pages/AddNutrition';
import AddWorkout from './pages/AddWorkout';
import WorkoutDetail from './pages/WorkoutDetail';
import Chat from './pages/Chat';
import GeneratePlan from './pages/GeneratePlan';
import PlanSession from './pages/PlanSession';
import RestScreen from './pages/RestScreen';
import WorkoutPlanList from './pages/WorkoutPlanList';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import Settings from './pages/Settings';
import Contact from './pages/Contact';

import ProtectedRoute from './components/ProtectedRoute';



function App() {
  return (
    <div className="font-sans text-gray-800 dark:text-gray-100 bg-slate-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
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
        <Route 
          path="/add-nutrition" 
          element={
            <ProtectedRoute>
              <AddNutrition />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/add-workout" 
          element={
            <ProtectedRoute>
              <AddWorkout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/workout-detail/:id" 
          element={
            <ProtectedRoute>
              <WorkoutDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/generate-plan" 
          element={
            <ProtectedRoute>
              <GeneratePlan />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/plan-session/:id/:planId/:dayNumber" 
          element={
            <ProtectedRoute>
              <PlanSession />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/rest-screen" 
          element={
            <ProtectedRoute>
              <RestScreen />
            </ProtectedRoute>
          } 
        />
        <Route 
            path="/workout-plan-list/:planId/:dayNumber" 
            element={
                <ProtectedRoute>
                    <WorkoutPlanList />
                </ProtectedRoute>
            } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
                <Profile />
            </ProtectedRoute>
        } /> 
        <Route 
          path="/change-password" 
          element={
            <ProtectedRoute>
                <ChangePassword />
            </ProtectedRoute>
        } />
        <Route 
          path="/settings" 
          element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } /> 
        <Route 
          path="/contact" 
          element={
          <ProtectedRoute>
            <Contact />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;