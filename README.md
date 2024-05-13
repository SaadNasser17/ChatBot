chatbot b darija :
A working DL model ✅
Understands the words from the dataset✅
Displays list of specialties ✅
Displays list of doctors according to the specialty ✅
Shows original agenda ✅
Filters the agenda ⏳
Takes user info ⏳
Takes the reservations ⏳












import React, { useState, useEffect } from 'react';

function Doctor({ specialty }) {
    const [doctors, setDoctors] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDoctorsForSpecialty(specialty);
    }, [specialty]);

    const fetchDoctorsForSpecialty = (specialtyName) => {
        // Fetching logic...
    };

    return (
        <div>
            {error && <p>{error}</p>}
            {doctors.map((doctor, index) => (
                <div key={index} className='doctor-info'>
                    <strong>{doctor.name}</strong><br />
                    {/* Additional doctor info... */}
                </div>
            ))}
        </div>
    );
}

export default Doctor;
