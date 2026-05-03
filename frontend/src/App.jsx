import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifierEmail from './pages/VerifierEmail';
import Dashboard from './pages/Dashboard';
import MesCours from './pages/MesCours';
import DetailCours from './pages/DetailCours';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verifier-email" element={<VerifierEmail />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/cours" element={<ProtectedRoute><MesCours /></ProtectedRoute>} />
          <Route path="/cours/:id" element={<ProtectedRoute><DetailCours /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
