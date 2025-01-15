import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const Login: React.FC = () => {
  const { login, error, isLoading } = useAuth();

  return (
    <div className="auth-container">
      <div className="auth-content">
        <h1 className="auth-title">ChromaCal</h1>
        <h2 className="auth-subtitle">Time Management, Simplified</h2>
        
        <div className="auth-actions">
          <button 
            onClick={login} 
            disabled={isLoading}
            className="auth-button"
          >
            {isLoading ? 'Connecting...' : 'Connect Google Calendar'}
          </button>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};