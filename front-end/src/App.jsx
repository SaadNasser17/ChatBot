import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Chat from './components/Chat';
import AdminPanel from './components/AdminPanel';
import { BookingProvider } from './components/BookingContext';

export default function App() {
  return (
    <BookingProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Router>
    </BookingProvider>
  );
}
