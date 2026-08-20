
import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import DashboardRedirect from './components/DashboardRedirect';
import InstructorRoute from './components/InstructorRoute';
import StudentRoute from './components/StudentRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import CoursesPage from './pages/CoursesPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import CourseMaterialsFolderPage from './pages/CourseMaterialsFolderPage';
import CourseAnnouncementsPage from './pages/CourseAnnouncementsPage';
import DashboardPage from './pages/DashboardPage';
import LearningPlanPage from './pages/LearningPlanPage';
import InstructorDashboard from './pages/InstructorDashboard';
import InstructorTodosPage from './pages/InstructorTodosPage';
import AdminDashboard from './pages/AdminDashboard';
import AccessDenied from './pages/AccessDenied';
import RoleFeaturePage from './pages/RoleFeaturePage';
import MyCoursesPage from './pages/MyCoursesPage';
import Profile from './pages/Profile'; // Import your Profile page

import { ROLES } from './utils/roles';


function Layout({ darkMode, setDarkMode }) {
  const location = useLocation();

  const hideNavbar =
    location.pathname === '/login' ||
    location.pathname === '/register';

  return (
    <>
      {!hideNavbar && (
        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      )}

      <main className="max-w-7xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route
            path="/courses"
            element={
              <StudentRoute>
                <CoursesPage />
              </StudentRoute>
            }
          />

          <Route path="/instructor" element={<InstructorRoute><InstructorDashboard /></InstructorRoute>} />
          <Route path="/instructor/courses" element={<InstructorRoute><CoursesPage /></InstructorRoute>} />
          <Route path="/instructor/courses/:courseId" element={<InstructorRoute><CourseDetailsPage /></InstructorRoute>} />
          <Route path="/instructor/courses/:courseId/materials/:folderType" element={<InstructorRoute><CourseMaterialsFolderPage /></InstructorRoute>} />
          <Route path="/instructor/courses/:courseId/announcements" element={<InstructorRoute><CourseAnnouncementsPage /></InstructorRoute>} />
          <Route path="/instructor/todos" element={<InstructorRoute><InstructorTodosPage /></InstructorRoute>} />
          <Route path="/instructor/:feature" element={<InstructorRoute><RoleFeaturePage /></InstructorRoute>} />

          <Route path="/student" element={<StudentRoute><DashboardPage /></StudentRoute>} />
          <Route path="/learning-plan" element={<StudentRoute><LearningPlanPage /></StudentRoute>} />
          <Route path="/my-courses" element={<StudentRoute><MyCoursesPage /></StudentRoute>} />
          <Route path="/my-courses/:courseId" element={<StudentRoute><CourseDetailsPage /></StudentRoute>} />
          <Route path="/my-courses/:courseId/materials/:folderType" element={<StudentRoute><CourseMaterialsFolderPage /></StudentRoute>} />
          <Route path="/my-courses/:courseId/announcements" element={<StudentRoute><CourseAnnouncementsPage /></StudentRoute>} />
          <Route path="/assignments" element={<StudentRoute><RoleFeaturePage /></StudentRoute>} />
          <Route path="/quizzes" element={<StudentRoute><RoleFeaturePage /></StudentRoute>} />
          <Route path="/progress" element={<StudentRoute><RoleFeaturePage /></StudentRoute>} />
          <Route path="/notifications" element={<RoleRoute allowedRoles={[ROLES.STUDENT, ROLES.INSTRUCTOR]}><RoleFeaturePage /></RoleRoute>} />
          <Route path="/profile" element={<ProtectedRoute><RoleFeaturePage /></ProtectedRoute>} />
          // Inside your router setup:
          <Route path="/profile" element={<Profile />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute><DashboardRedirect /></ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <RoleRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminDashboard />
              </RoleRoute>
            }
          />
          <Route path="/admin/:feature" element={<RoleRoute allowedRoles={[ROLES.ADMIN]}><RoleFeaturePage /></RoleRoute>} />
          <Route path="/access-denied" element={<ProtectedRoute><AccessDenied /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </>
  );
}


export default function App() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        <Router>
          <Layout
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        </Router>
      </div>
    </AuthProvider>
  );
}

