import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import { BookingProvider } from './components/BookingContext';
import Chat from './page/Chat';
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
