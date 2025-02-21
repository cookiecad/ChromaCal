import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const styles = {
  authContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '2rem',
    textAlign: 'center',
  } as const,

  authContent: {
    maxWidth: '600px',
    width: '100%',
  },

  authTitle: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },

  authSubtitle: {
    fontSize: '1.5rem',
    marginBottom: '2rem',
    opacity: 0.8,
  },

  authActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  } as const,

  authButton: {
    padding: '1rem 2rem',
    fontSize: '1.2rem',
    borderRadius: '8px',
    border: 'none',
    background: '#007AFF',
    color: 'white',
    cursor: 'pointer',
    transition: 'background 0.2s',
    '&:hover': {
      background: '#0056b3',
    },
    '&:disabled': {
      background: '#ccc',
      cursor: 'not-allowed',
    },
  },

  helpButton: {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    border: '1px solid #007AFF',
    borderRadius: '6px',
    background: 'transparent',
    color: '#007AFF',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      background: '#007AFF',
      color: 'white',
    },
  },

  linkButton: {
    display: 'block',
    margin: '0.5rem 0',
    padding: '0.5rem',
    background: 'none',
    border: 'none',
    color: '#007AFF',
    textDecoration: 'underline',
    cursor: 'pointer',
    '&:hover': {
      color: '#0056b3',
    },
  },

  helpContent: {
    textAlign: 'left',
    marginTop: '2rem',
    padding: '1.5rem',
    background: '#f5f5f5',
    borderRadius: '8px',
  } as const,

  helpTitle: {
    marginBottom: '1rem',
  },

  helpList: {
    paddingLeft: '1.5rem',
  },

  helpListItem: {
    marginBottom: '1rem',
  },

  subList: {
    margin: '0.5rem 0',
    paddingLeft: '1.5rem',
  },

  subListItem: {
    marginBottom: '0.5rem',
  },

  errorMessage: {
    color: '#dc3545',
    marginTop: '1rem',
    padding: '1rem',
    background: '#f8d7da',
    borderRadius: '6px',
  },

  credentialsMissing: {
    padding: '1.5rem',
    background: '#f8d7da',
    borderRadius: '8px',
    marginBottom: '1rem',
  },

  errorText: {
    color: '#dc3545',
    marginBottom: '1rem',
  },
};

export const Login: React.FC = () => {
  const { login, error, isLoading, credentialsStatus } = useAuth();
  const [showHelp, setShowHelp] = useState(false);

  const handleCredentialsHelp = () => {
    setShowHelp(true);
  };

  const openCredentialsLocation = async () => {
    if (credentialsStatus?.path) {
      await window.api.shell.showItemInFolder(credentialsStatus.path);
    }
  };

  const openGoogleConsole = async () => {
    await window.api.shell.openExternal('https://console.cloud.google.com/apis/credentials');
  };

  return (
    <div style={styles.authContainer}>
      <div style={styles.authContent}>
        <h1 style={styles.authTitle}>ChromaCal</h1>
        <h2 style={styles.authSubtitle}>Time Management, Simplified</h2>
        
        <div style={styles.authActions}>
          {credentialsStatus?.exists ? (
            <button 
              onClick={login} 
              disabled={isLoading}
              style={styles.authButton}
            >
              {isLoading ? 'Connecting...' : 'Connect Google Calendar'}
            </button>
          ) : (
            <div style={styles.credentialsMissing}>
              <p style={styles.errorText}>Google Calendar credentials are required to use ChromaCal.</p>
              <button 
                onClick={handleCredentialsHelp}
                style={styles.helpButton}
              >
                How to Set Up Credentials
              </button>
            </div>
          )}
          
          {showHelp && (
            <div style={styles.helpContent}>
              <h3 style={styles.helpTitle}>Setting Up Google Calendar Access</h3>
              <ol style={styles.helpList}>
                <li style={styles.helpListItem}>
                  Go to the Google Cloud Console
                  <button onClick={openGoogleConsole} style={styles.linkButton}>
                    Open Google Cloud Console
                  </button>
                </li>
                <li style={styles.helpListItem}>Create a new project or select an existing one</li>
                <li style={styles.helpListItem}>Enable the Google Calendar API for your project</li>
                <li style={styles.helpListItem}>
                  Create OAuth 2.0 credentials:
                  <ul style={styles.subList}>
                    <li style={styles.subListItem}>Choose "Desktop Application" as the application type</li>
                    <li style={styles.subListItem}>Download the credentials file</li>
                    <li style={styles.subListItem}>Rename it to "google-credentials.json"</li>
                  </ul>
                </li>
                <li style={styles.helpListItem}>
                  Place the file in the ChromaCal data directory
                  <button onClick={openCredentialsLocation} style={styles.linkButton}>
                    Open Data Directory
                  </button>
                </li>
                <li style={styles.helpListItem}>Restart ChromaCal after adding the credentials</li>
              </ol>
            </div>
          )}
          
          {error && (
            <div style={styles.errorMessage}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};