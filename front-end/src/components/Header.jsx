// Header Component with Sidebar Update
import React, { useState } from 'react';
import { Columns3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // For navigation

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate(); // Navigation hook

  const handleSidebarToggle = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  const handleNavigation = (path) => {
    navigate(path); // Navigate to different routes
  };

  const handleLogout = () => {
    // Clear any stored authentication status
    localStorage.removeItem('isAuthenticated'); // Assuming authentication is stored in localStorage
    navigate('/login'); // Redirect to login page
  };

  return (
    <>
      {/* Header */}
      <header style={styles.header}>
        {/* Sidebar Icon */}
        <div
          style={styles.leftContainer}
          onMouseEnter={() => setIsSidebarOpen(true)}
          onMouseLeave={() => setIsSidebarOpen(false)}
        >
          <div style={styles.iconContainer} onClick={handleSidebarToggle}>
            <Columns3 style={styles.icon} />
          </div>

          {/* Nabady Logo */}
          <div
            onClick={() => handleNavigation('/admin')} // Navigates back to Admin Panel
            style={{ ...styles.logoContainer, cursor: 'pointer' }} // Merged style objects here
          >
            <img src="/nabady_chatbot.svg" alt="Logo" style={styles.logo} />
          </div>
        </div>

        {/* Log Out Button */}
        <div style={styles.logoutContainer}>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Log Out
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <div
        style={{
          ...styles.sidebar,
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
        }}
        onMouseEnter={() => setIsSidebarOpen(true)}
        onMouseLeave={() => setIsSidebarOpen(false)}
      >
        <ul style={styles.sidebarList}>
          <li
            style={styles.sidebarItem}
            onClick={() => handleNavigation('/statistiques')}
          >
            Statistiques
          </li>
          <li
            style={styles.sidebarItem}
            onClick={() => handleNavigation('/rendezvous')}
          >
            Rendez vous
          </li>
          <li
            style={styles.sidebarItem}
            onClick={() => handleNavigation('/motspourrendezvous')}
          >
            Mots pour rendez-vous
          </li>
        </ul>
      </div>
    </>
  );
};

const styles = {
  header: {
    width: '100%',
    height: '80px',
    backgroundColor: 'rgb(69, 166, 197)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1000,
  },
  leftContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  logoContainer: {
    marginLeft: '20px',
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    height: '60px',
    width: 'auto',
  },
  iconContainer: {
    cursor: 'pointer',
  },
  icon: {
    color: '#fff',
    width: '32px',
    height: '32px',
  },
  logoutContainer: {
    marginLeft: 'auto',
    marginRight: '20px',
  },
  logoutButton: {
    backgroundColor: '#FF4D4D',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    border: 'none',
    fontSize: '16px',
  },
  sidebar: {
    position: 'fixed',
    top: '80px',
    left: 0,
    width: '200px',
    height: '100%',
    backgroundColor: 'rgb(32, 122, 150)',
    padding: '20px',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    zIndex: 1001,
    transform: 'translateX(-100%)',
  },
  sidebarList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  sidebarItem: {
    padding: '10px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

export default Header;