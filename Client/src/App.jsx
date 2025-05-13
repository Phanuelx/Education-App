// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Authentication Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

// Protected Routes
import ProtectedRoute from "./components/ProtectedRoute";

// Layout Components
import MainLayout from "./components/layout/MainLayout";

// Public Pages
import HomePage from "./pages/HomePage";
import CourseListing from "./pages/CourseListing";
import CourseDetailPage from "./pages/CourseDetailPage";
import CourseForm from "./pages/CourseForm";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./components/admin/UserManagement";
import CourseManagement from "./components/admin/CourseManagement";
import SystemSettings from "./components/admin/SystemSettings";

// Teacher Pages
import TeacherDashboard from "./pages/TeacherDashboard";
import ClassScheduler from "./components/teacher/ClassScheduler";

// Student Pages
import StudentDashboard from "./pages/StudentDashboard";

// Toast provider for notifications
import { Toaster } from "sonner";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <MainLayout>
                <HomePage />
              </MainLayout>
            }
          />
          <Route
            path="/courses"
            element={
              <MainLayout>
                <CourseListing />
              </MainLayout>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <MainLayout>
                <CourseDetailPage />
              </MainLayout>
            }
          />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout>
                  <AdminDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout>
                  <UserManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout>
                  <CourseManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout>
                  <SystemSettings />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/courses/new"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout>
                  <CourseForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={["TEACHER"]}>
                <MainLayout>
                  <TeacherDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/schedule"
            element={
              <ProtectedRoute allowedRoles={["TEACHER"]}>
                <MainLayout>
                  <ClassScheduler />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/courses/new"
            element={
              <ProtectedRoute allowedRoles={["TEACHER"]}>
                <MainLayout>
                  <CourseForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <MainLayout>
                  <StudentDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/courses/:id"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <MainLayout>
                  <CourseDetailPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;
