import React from 'react';
import { BookingProvider } from './components/BookingContext';
import Chat from './page/Chat';
export default function App() {
  return (
    <BookingProvider>
      <Chat />
    </BookingProvider>
  );
}
