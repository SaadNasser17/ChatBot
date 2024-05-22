import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export function useBooking() {
    return useContext(BookingContext);
}

export function BookingProvider({ children }) {
    const [bookingDetails, setBookingDetails] = useState({});

    return (
        <BookingContext.Provider value={{ bookingDetails, setBookingDetails }}>
            {children}
        </BookingContext.Provider>
    );
}
