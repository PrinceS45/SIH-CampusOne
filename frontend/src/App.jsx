import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
// import Layout from './components/layout/Layout.jsx';
import Layout from "./components/layouts/Layout.jsx"
import Login from './components/auth/Login';
import AdminDashboard from './components/dashboard/AdminDashboard';
import StudentList from './components/students/StudentList';
import StudentForm from './components/students/StudentForm';
import StudentProfile from './components/students/StudentProfile';
import FeeCollection from './components/fees/FeeCollection';
import FeeReport from './components/fees/FeeReport';
import HostelManagement from './components/hostels/HostelManagement';
import HostelAllocation from './components/hostels/HostelAllocation';
import ExamForm from './components/exams/ExamForm';
import ExamResults from './components/exams/ExamResults';
import DashboardReports from './components/reports/DashboardReports';
import useAuthStore from "./stores/authStore.js"
import StudentEdit from './components/students/StudentEdit.jsx';
import FeeReceipt from './components/fees/FeeReceipt';


function App() {
  const { isAuthenticated, user } = useAuthStore();

  // Check if user is authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      useAuthStore.setState({ 
        isAuthenticated: true, 
        token, 
        user: JSON.parse(userData) 
      });
    }
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

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
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
        <Route path="/students/:id/edit" element={<StudentEdit />} />

        
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
        
<Route path="/fees/receipt/:id" element={<FeeReceipt />} />

        
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
          path="/reports" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardReports />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" replace />} 
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