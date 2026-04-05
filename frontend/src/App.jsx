import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Layout from "./components/layouts/Layout.jsx"
import Loader from './components/common/Loader';
import Login from './components/auth/Login';
import AdminDashboard from './components/dashboard/AdminDashboard';
import StudentList from './components/students/StudentList';
import StudentForm from './components/students/StudentForm';
import StudentProfile from './components/students/StudentProfile';
import FeeCollection from './components/fees/FeeCollection';
import FeeReport from './components/fees/FeeReport';
import HostelManagement from './components/hostels/HostelManagement';
import HostelAllocation from './components/hostels/HostelAllocation';
import RoomStatus from './components/hostels/RoomStatus';
import ExamForm from './components/exams/ExamForm';
import ExamResults from './components/exams/ExamResults';
import GradeSheet from './components/exams/GradeSheet';
import DashboardReports from './components/reports/DashboardReports';
import useAuthStore from "./stores/authStore.js"
import StudentEdit from './components/students/StudentEdit.jsx';
import FeeReceipt from './components/fees/FeeReceipt';
import StudentDashboard from './components/dashboard/StudentDashboard.jsx';
import Feed from './components/feed/Feed';
import EventCalendar from './components/calendar/EventCalendar';
import AlumniNetwork from './components/alumni/AlumniNetwork';
import MarkAttendance from './components/attendance/MarkAttendance';
import AttendanceHistory from './components/attendance/AttendanceHistory';
import MyAttendance from './components/attendance/MyAttendance';
import StaffList from './components/staff/StaffList';
import StaffForm from './components/staff/StaffForm';
import StaffProfile from './components/staff/StaffProfile';

function App() {
  const { isAuthenticated, user, initializeAuth } = useAuthStore();

  // Check if user is authenticated on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
      return <Navigate to="/dashboard" replace />;
    }

    return <Layout>{children}</Layout>;
  };

  if (isAuthenticated === undefined) {
    return <Loader fullPage message="Initializing CampusOne..." />;
  }

  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {user?.role === 'student' ? <StudentDashboard /> : <AdminDashboard />}
            </ProtectedRoute>
          }
        />

        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <StudentList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/students/new"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <StudentForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/students/:id"
          element={
            <ProtectedRoute>
              <StudentProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/students/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <StudentEdit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fees"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <FeeCollection />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fees/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <FeeReport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fees/receipt/:id"
          element={
            <ProtectedRoute>
              <FeeReceipt />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hostels"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <HostelManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hostels/allocate"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <HostelAllocation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hostels/rooms"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <RoomStatus />
            </ProtectedRoute>
          }
        />

        <Route
          path="/exams"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <ExamForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/exams/results"
          element={
            <ProtectedRoute>
              <ExamResults />
            </ProtectedRoute>
          }
        />

        <Route
          path="/exams/gradesheet/:studentId"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff', 'student']}>
              <GradeSheet />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardReports />
            </ProtectedRoute>
          }
        />
       
        <Route
          path="/feed"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff', 'student', 'alumni']}>
              <Feed />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff', 'student', 'alumni']}>
              <EventCalendar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alumni"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff', 'student', 'alumni']}>
              <AlumniNetwork />
            </ProtectedRoute>
          }
        />


        <Route
          path="/attendance/mark"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <MarkAttendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance/history"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <AttendanceHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance/my"
          element={
            <ProtectedRoute allowedRoles={['student', 'staff', 'admin', 'alumni']}>
              <MyAttendance />
            </ProtectedRoute>
          }
        />

        {/* Staff Management Routes */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StaffList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/new"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StaffForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <StaffProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StaffForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            isAuthenticated ?
              <Navigate to="/dashboard" replace /> :
              <Navigate to="/login" replace />
          }
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;