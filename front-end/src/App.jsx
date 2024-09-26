import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import Statistiques from './components/Statistiques';
import RendezVous from './components/RendezVous';
import { BookingProvider } from './components/BookingContext';
import Chat from './page/Chat';
import Header from './components/Header';
import Authentification from './components/Authentification';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(auth);
    };

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
          <Route path="/login" element={<Authentification setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Header />
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="/statistiques" element={
            <ProtectedRoute>
              <Header />
              <Statistiques />
            </ProtectedRoute>
          } />
          <Route path="/rendezvous" element={
            <ProtectedRoute>
              <Header />
              <RendezVous />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </BookingProvider>
  );
}