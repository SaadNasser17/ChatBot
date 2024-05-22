import React from 'react';
import Chat from './components/Chat';
import { BookingProvider } from './components/BookingContext';

export default function App() {
  return (
    <BookingProvider>
      <Chat />
    </BookingProvider>
  );
}
