import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export function useBooking() {
    return useContext(BookingContext);
}

export function BookingProvider({ children }) {
    const [bookingDetails, setBookingDetails] = useState({
        doctorName: '',
        PcsID: '',
        timeSlot: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        email: ''
    });

    return (
        <BookingContext.Provider value={{ bookingDetails, setBookingDetails }}>
            {children}
        </BookingContext.Provider>
    );
}
