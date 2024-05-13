import React, { useState, useEffect } from 'react';

function Doctor({ specialty }) {
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (specialty) {
      fetchDoctorsForSpecialty(specialty);
    }
  }, [specialty]);

  const fetchDoctorsForSpecialty = (specialtyName) => {
    fetch('https://apiuat.nabady.ma/api/users/medecin/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ "query": specialtyName, "consultation": "undefined", "page": 1, "result": 5, "isIframe": false, "referrer": "" })
    })
    .then(response => response.json())
    .then(data => {
      displayDoctors(data.praticien.data);
    })
    .catch(error => {
      console.error('Error fetching doctors:', error);
      setError('Failed to fetch doctors.');
    });
  };

  const displayDoctors = (doctorData) => {
    setDoctors(doctorData.map((item) => {
      const doctor = item["0"];
      return {
        name: `Dr. ${doctor.lastname} ${doctor.firstname}`,
        tel: doctor.tel,
        email: doctor.email,
        address: doctor.adresse,
        agendaConfig: doctor.praticienCentreSoins[0].agendaConfig,
      };
    }).filter(doctor => hasAvailableSlots(doctor.agendaConfig)));
  };

  const hasAvailableSlots = (agendaConfig) => {
    const now = new Date();
    const closingTime = new Date();
    closingTime.setHours(parseInt(agendaConfig.heureFermeture.split(':')[0], 10), parseInt(agendaConfig.heureFermeture.split(':')[1], 10), 0);
    return now < closingTime;
  };

  const createAgendaGrid = (agendaConfig) => {
    const closingHour = parseInt(agendaConfig.heureFermeture.split(':')[0], 10);
    const closingMinute = parseInt(agendaConfig.heureFermeture.split(':')[1], 10);
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Check if the current time is before the doctor's closing time
    return (currentHour < closingHour || (currentHour === closingHour && currentMinute < closingMinute));
  };

  return (
    <div>
      {error && <p>{error}</p>}
      {doctors.map((doctor, index) => (
        <div key={index} className='doctor-info'>
          <strong>{doctor.name}</strong><br />
          Tel: {doctor.tel}<br />
          Email: <a href={`mailto:${doctor.email}`}>{doctor.email}</a><br />
          Address: {doctor.address}<br />
          {createAgendaGrid(doctor.agendaConfig)}
        </div>
      ))}
    </div>
  );
}

export default Doctor;
