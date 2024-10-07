import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, LockKeyhole } from 'lucide-react';

const Authentication = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    const adminUsername = 'admin';
    const adminPassword = 'MIBTECH24';

    if (username.trim() === adminUsername && password.trim() === adminPassword) {
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);  // Update the app state
      navigate('/admin', { replace: true });
    } else {
      setError('Invalid username or password');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div style={styles.container}>
      <img src="/nabady_chatbot.svg" alt="NabadyBot Logo" style={styles.logo} />
      <p style={styles.analyticsText}>NabadyBot Analytics</p>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>
        <div style={styles.inputContainer}>
          <label style={styles.label}>Username</label>
          <div style={styles.inputWrapper}>
            <User style={styles.icon} />
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>
        <div style={styles.inputContainer}>
          <label style={styles.label}>Password</label>
          <div style={styles.inputWrapper}>
            <LockKeyhole style={styles.icon} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
            {showPassword ? (
              <EyeOff onClick={togglePasswordVisibility} style={styles.eyeIcon} />
            ) : (
              <Eye onClick={togglePasswordVisibility} style={styles.eyeIcon} />
            )}
          </div>
        </div>
        <button onClick={handleLogin} style={styles.button}>
          Log In
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundImage: 'url(green_blue.jpg)', // Adjust path if necessary
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    color: '#fff', // Set default text color to white for better contrast
  },
  logo: {
    width: '150px',
    marginBottom: '10px',
  },
  analyticsText: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#fff', // Make sure text is visible on the background
  },
  card: {
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    width: '300px',
    textAlign: 'center',
    backgroundColor: '#fff',
    color: '#000', // Set text color to black inside the card
  },
  title: {
    marginBottom: '20px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    marginBottom: '20px',
    textAlign: 'left',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  label: {
    fontSize: '14px',
    color: '#333',
    marginBottom: '5px',
  },
  icon: {
    position: 'absolute',
    left: '10px',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px 10px 10px 40px', // Adjust padding for icons
    borderRadius: '4px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    color: '#000', // Ensure input text is black
  },
  eyeIcon: {
    position: 'absolute',
    right: '10px',
    cursor: 'pointer',
    color: '#333',
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#007bff',
    color: '#fff',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
};

export default Authentication;