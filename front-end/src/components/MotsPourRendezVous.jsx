import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MotsPourRendezVous = () => {
  const [actionWords, setActionWords] = useState([]);
  const [appointmentKeywords, setAppointmentKeywords] = useState([]);
  const [medicalWords, setMedicalWords] = useState([]);
  const [newActionWord, setNewActionWord] = useState('');
  const [newAppointmentKeyword, setNewAppointmentKeyword] = useState('');
  const [newMedicalWord, setNewMedicalWord] = useState('');

  // Fetch words from the backend when the component mounts
  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get_word_lists');
        setActionWords(response.data.actionWords);
        setAppointmentKeywords(response.data.appointmentKeywords);
        setMedicalWords(response.data.medicalWords);
      } catch (error) {
        console.error('Error fetching word lists:', error);
      }
    };

    fetchWords();
  }, []);

  const handleAddWord = async (type) => {
    let newWord = '';

    if (type === 'actionWords') {
      newWord = newActionWord;
    } else if (type === 'appointmentKeywords') {
      newWord = newAppointmentKeyword;
    } else if (type === 'medicalWords') {
      newWord = newMedicalWord;
    }

    if (newWord.trim() === '') return;

    try {
      // Send the new word to the backend to save it in the database
      await axios.post('http://localhost:5000/add_word', { type, word: newWord });

      // Update the state to reflect the new word in the UI
      if (type === 'actionWords') {
        setActionWords([...actionWords, newWord]);
        setNewActionWord('');
      } else if (type === 'appointmentKeywords') {
        setAppointmentKeywords([...appointmentKeywords, newWord]);
        setNewAppointmentKeyword('');
      } else if (type === 'medicalWords') {
        setMedicalWords([...medicalWords, newWord]);
        setNewMedicalWord('');
      }
    } catch (error) {
      console.error('Error adding word:', error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h3>Action Words</h3>
        <ul>
          {actionWords.map((word, index) => (
            <li key={index}>{word}</li>
          ))}
        </ul>
        <input
          type="text"
          value={newActionWord}
          onChange={(e) => setNewActionWord(e.target.value)}
          placeholder="Add new action word"
          style={styles.input}
        />
        <button onClick={() => handleAddWord('actionWords')} style={styles.button}>
          Add
        </button>
      </div>

      <div style={styles.card}>
        <h3>Appointment Keywords</h3>
        <ul>
          {appointmentKeywords.map((word, index) => (
            <li key={index}>{word}</li>
          ))}
        </ul>
        <input
          type="text"
          value={newAppointmentKeyword}
          onChange={(e) => setNewAppointmentKeyword(e.target.value)}
          placeholder="Add new appointment keyword"
          style={styles.input}
        />
        <button onClick={() => handleAddWord('appointmentKeywords')} style={styles.button}>
          Add
        </button>
      </div>

      <div style={styles.card}>
        <h3>Medical Words</h3>
        <ul>
          {medicalWords.map((word, index) => (
            <li key={index}>{word}</li>
          ))}
        </ul>
        <input
          type="text"
          value={newMedicalWord}
          onChange={(e) => setNewMedicalWord(e.target.value)}
          placeholder="Add new medical word"
          style={styles.input}
        />
        <button onClick={() => handleAddWord('medicalWords')} style={styles.button}>
          Add
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '20px',
    marginTop: '100px', // To avoid overlap with the fixed header
  },
  card: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '30%',
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: 'rgb(69, 166, 197)',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default MotsPourRendezVous;
