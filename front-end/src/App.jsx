import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import Statistiques from './components/Statistiques';
import RendezVous from './components/RendezVous';
import MotsPourRendezVous from './components/MotsPourRendezVous';
import { BookingProvider } from './components/BookingContext';
import Chat from './page/Chat';
import Header from './components/Header';
import Authentification from './components/Authentification';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(auth);
    };

    // Check authentication state on refresh and listen for any changes
    checkAuth();
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <BookingProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route
            path="/login"
            element={<Authentification setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Header />
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/statistiques"
            element={
              <ProtectedRoute>
                <Header />
                <Statistiques />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rendezvous"
            element={
              <ProtectedRoute>
                <Header />
                <RendezVous />
              </ProtectedRoute>
            }
          />
          <Route
            path="/motspourrendezvous"
            element={
              <ProtectedRoute>
                <Header />
                <MotsPourRendezVous />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </BookingProvider>
  );
}
