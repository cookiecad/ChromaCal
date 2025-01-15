import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Login } from './auth/Login';
import { Dashboard } from './dashboard/Dashboard';

// Protected Route wrapper component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

// App Routes component
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <div className="app-container">
            {isAuthenticated ? <Navigate to="/" /> : <Login />}
          </div>
        } 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <div className="app-container">
              <Dashboard />
            </div>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;