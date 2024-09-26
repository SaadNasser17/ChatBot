import React, { useState, useEffect } from 'react';

const RendezVous = () => {
  const [stats, setStats] = useState({
    today: 0,
    thisWeek: 0,
    total: 0,
  });

  useEffect(() => {
    // Fetch appointment statistics from backend
    fetch('http://localhost:5000/appointment_stats')
      .then(response => response.json())
      .then(data => {
        setStats(data);
      })
      .catch(error => console.error('Error fetching stats:', error));
}, []);


  return (
    <div className="rendezvous-container">
      <table className="appointment-stats-table">
        <thead>
          <tr>
            <th>Rendez vous pris aujourd'hui</th>
            <th>Rendez vous pris cette semaine</th>
            <th>Rendez pris en totale</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{stats.today}</td>
            <td>{stats.thisWeek}</td>
            <td>{stats.total}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default RendezVous;
