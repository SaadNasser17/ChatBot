import React, { useEffect, useState } from 'react';

const Statistiques = () => {
  const [unrecognizedCounts, setUnrecognizedCounts] = useState({
    darija: 0,
    'الدارجة': 0,
    'العربية': 0,
    english: 0,
    francais: 0,
  });

  useEffect(() => {
    // Fetching unrecognized intents counts from API
    fetch('http://localhost:5000/unrecognized_intents')
      .then(response => response.json())
      .then(data => {
        // Updating counts for each language
        const updatedCounts = {};
        Object.keys(unrecognizedCounts).forEach(language => {
          updatedCounts[language] = data.unrecognized_intents[language]?.length || 0;
        });
        setUnrecognizedCounts(updatedCounts);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className="statistiques-container" style={styles.container}>
      <h2 style={styles.header}>Unrecognized Intents Count</h2>
      <div style={styles.cardsContainer}>
        {Object.entries(unrecognizedCounts).map(([language, count], index) => (
          <div
            key={index}
            className="stat-card"
            style={{
              ...styles.card,
              width: index < 4 ? '35%' : '40%', // 2 per row for first 4 cards, last one is 80%
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <h3 style={styles.language}>{`UNRECOGNIZED WORDS FOR ${language.toUpperCase()}`}</h3>
            <p style={styles.count}>{count}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    textAlign: 'center',
  },
  header: {
    fontSize: '30px',
    fontWeight: 'bold',
    marginBottom: '40px',
  },
  cardsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center', // Centering the cards
    gap: '20px', // Add space between cards
  },
  card: {
    backgroundColor: '#f0f0f0',
    borderRadius: '15px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '20px',
    boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
    height: '200px', // Reduced height
    width: '250px', // Updated width to reduce size
  },
  language: {
    fontSize: '16px', // Reduced font size for text
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: '10px',
  },
  count: {
    fontSize: '40px', // Reduced font size for the count
    fontWeight: 'bold',
    color: '#0dcaf0',
  },
};

export default Statistiques;
