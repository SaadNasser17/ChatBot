import React, { useState, useEffect } from 'react';

const RendezVous = () => {
  const [stats, setStats] = useState({
    today: 5,        // Static data for today's appointments
    thisWeek: 20,    // Static data for this week's appointments
    total: 150,      // Static data for total appointments
  });

  useEffect(() => {
    // Uncomment this section once backend is available
    // fetch('http://localhost:5000/appointment_stats')
    //   .then(response => response.json())
    //   .then(data => {
    //     setStats(data);
    //   })
    //   .catch(error => console.error('Error fetching stats:', error));
  }, []);

  const todayDate = new Date().toLocaleDateString();

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '10px',
    },
    subtitle: {
      fontSize: '18px',
      color: '#666',
      marginBottom: '30px',
    },
    date: {
      fontSize: '16px',
      color: '#999',
      marginBottom: '20px',
    },
    cardContainer: {
      display: 'flex',
      gap: '20px',
      justifyContent: 'center',
    },
    card: {
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#fff',
      minWidth: '200px',
      textAlign: 'center',
    },
    cardTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#007bff',
      marginBottom: '10px',
    },
    cardValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Analyse des rendez-vous pris</h1>
      <p style={styles.subtitle}>En utilisant NabadyBot, suivez les statistiques de rendez-vous en temps réel.</p>
      <p style={styles.date}>Date : {todayDate}</p>
      <div style={styles.cardContainer}>
        <div style={styles.card}>
          <p style={styles.cardTitle}>Rendez-vous pris aujourd'hui</p>
          <p style={styles.cardValue}>{stats.today}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardTitle}>Rendez-vous pris cette semaine</p>
          <p style={styles.cardValue}>{stats.thisWeek}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardTitle}>Rendez-vous pris au total</p>
          <p style={styles.cardValue}>{stats.total}</p>
        </div>
      </div>
    </div>
  );
};

export default RendezVous;
