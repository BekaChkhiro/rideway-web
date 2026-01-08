import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Movies from './pages/Movies';
import MovieDetails from './pages/MovieDetails';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/movies" 
              element={
                <ProtectedRoute>
                  <Movies />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/movies/:id" 
              element={
                <ProtectedRoute>
                  <MovieDetails />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/movies" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;