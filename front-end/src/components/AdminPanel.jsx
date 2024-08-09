import React, { useState, useEffect } from 'react';
import IntentDetails from './IntentDetails';

function AdminPanel() {
  const [unrecognizedIntents, setUnrecognizedIntents] = useState({
    darija: [],
    'الدارجة': [],
    'العربية': [],
    francais: [],
    english: []
  });
  const [existingIntents, setExistingIntents] = useState({
    darija: [],
    'الدارجة': [],
    'العربية': [],
    francais: [],
    english: []
  });
  const [selectedIntent, setSelectedIntent] = useState(null);
  const [error, setError] = useState(null);
  const [newIntent, setNewIntent] = useState({
    darija: { tag: '', patterns: '', responses: '' },
    'الدارجة': { tag: '', patterns: '', responses: '' },
    'العربية': { tag: '', patterns: '', responses: '' },
    francais: { tag: '', patterns: '', responses: '' },
    english: { tag: '', patterns: '', responses: '' },
  });

  useEffect(() => {
    fetch('http://localhost:5000/unrecognized_intents')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const formattedIntents = Object.entries(data.unrecognized_intents).reduce((acc, [language, words]) => {
          acc[language] = words.map(word => ({ words: [word], language }));
          return acc;
        }, {});
        setUnrecognizedIntents(formattedIntents);
      })
      .catch(error => {
        console.error('There was an error fetching the unrecognized intents!', error);
        setError(error.message);
      });
  }, []);

  const handleAddIntent = (language) => {
    const payload = {
      tag: newIntent[language].tag,
      patterns: newIntent[language].patterns.split(',').map(p => p.trim()),
      responses: newIntent[language].responses.split(',').map(r => r.trim()),
    };

    fetch(`http://localhost:5000/add_intent/${language}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        alert('New intent added successfully!');
        setNewIntent({
          darija: { tag: '', patterns: '', responses: '' },
          'الدارجة': { tag: '', patterns: '', responses: '' },
          'العربية': { tag: '', patterns: '', responses: '' },
          francais: { tag: '', patterns: '', responses: '' },
          english: { tag: '', patterns: '', responses: '' },
        });
        setSelectedIntent(null);
        handleLoadIntent(language); // Reload the intents for this language
      })
      .catch(error => {
        console.error('There was an error adding the new intent!', error);
        setError(error.message);
      });
  };

  const removeIntentFromList = (intent) => {
    if (intent.isUnrecognized) {
      setUnrecognizedIntents(prev => {
        const newIntents = { ...prev };
        newIntents[intent.language] = newIntents[intent.language].filter(i => i !== intent);
        return newIntents;
      });
    } else {
      handleLoadIntent(intent.language); // Reload the intents for this language
    }
  };

  const handleLoadIntent = (language) => {
    fetch(`http://localhost:5000/load_intents/${language}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const formattedIntents = data.intents.map(intent => ({
          tag: intent.tag,
          words: intent.patterns,
          responses: intent.responses,
          language: language,
          isUnrecognized: false
        }));

        setExistingIntents(prevIntents => ({
          ...prevIntents,
          [language]: formattedIntents,
        }));

        alert('Loaded successfully!');
      })
      .catch(error => {
        console.error('There was an error loading the intents!', error);
        setError(error.message);
      });
  };

  const updateExistingIntents = (language) => {
    handleLoadIntent(language);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerText}>NABADYBOT ADMIN</h1>
      </div>
      {error && <p style={styles.errorText}>Error: {error}</p>}

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>List of Unrecognized Intents</h2>
        <div style={styles.gridContainer}>
          {Object.entries(unrecognizedIntents).map(([language, intents]) => (
            <div key={language} style={styles.gridItem}>
              <h3 style={styles.languageTitle}>{language}</h3>
              {intents.length > 0 ? (
                <ul style={styles.intentList}>
                  {intents.map((intent, index) => (
                    <li
                      key={index}
                      style={styles.intentListItem}
                      onClick={() => setSelectedIntent({ ...intent, isUnrecognized: true })}
                    >
                      {intent.words.join(', ')}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={styles.noIntentsText}>No unrecognized intents found for {language}.</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Add New Intent</h2>
        <div style={styles.gridContainer}>
          {Object.entries(newIntent).map(([language, intent], index) => (
            <div key={index} style={styles.gridItem}>
              <h3 style={styles.languageTitle}>{language}</h3>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Tag</label>
                <input
                  type="text"
                  value={intent.tag}
                  onChange={(e) => setNewIntent({ ...newIntent, [language]: { ...intent, tag: e.target.value } })}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Patterns (comma-separated)</label>
                <input
                  type="text"
                  value={intent.patterns}
                  onChange={(e) => setNewIntent({ ...newIntent, [language]: { ...intent, patterns: e.target.value } })}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Responses (comma-separated)</label>
                <input
                  type="text"
                  value={intent.responses}
                  onChange={(e) => setNewIntent({ ...newIntent, [language]: { ...intent, responses: e.target.value } })}
                  style={styles.input}
                />
              </div>
              <button
                onClick={() => handleAddIntent(language)}
                style={styles.saveButton}
              >
                Save
              </button>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Load Existing Intents</h2>
        <div style={styles.buttonGroup}>
          {Object.keys(existingIntents).map((language) => (
            <button
              key={language}
              onClick={() => handleLoadIntent(language)}
              style={styles.loadButton}
            >
              Load Intents for {language}
            </button>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Existing Intents</h2>
        <div style={styles.gridContainer}>
          {Object.entries(existingIntents).map(([language, intents]) => (
            <div key={language} style={styles.gridItem}>
              <h3 style={styles.languageTitle}>{language}</h3>
              {intents.length > 0 ? (
                <ul style={styles.intentList}>
                  {intents.map((intent, index) => (
                    <li
                      key={index}
                      style={styles.intentListItem}
                      onClick={() => setSelectedIntent({ ...intent, isUnrecognized: false })}
                    >
                      {intent.words.join(', ')} - Tag: {intent.tag}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={styles.noIntentsText}>No intents found for {language}.</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {selectedIntent && (
        <IntentDetails
          intent={selectedIntent}
          setSelectedIntent={setSelectedIntent}
          removeIntentFromList={removeIntentFromList}
          updateExistingIntents={updateExistingIntents}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '90%',
    maxWidth: '1200px',
    margin: '20px auto',
    backgroundColor: '#f8f9fa',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    borderRadius: '8px',
  },
  header: {
    backgroundColor: '#17a2b8',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    color: '#fff',
  },
  headerText: {
    color: '#333',
    margin: '0',
    fontSize: '2rem',
    fontWeight: 'bold',
  },
  section: {
    marginTop: '30px',
  },
  sectionTitle: {
    color: '#007bff',
    fontSize: '1.5rem',
    marginBottom: '20px',
  },
  gridContainer: {
    display: 'grid',
    gap: '20px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  },
  gridItem: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #ddd',
  },
  languageTitle: {
    marginBottom: '15px',
    color: '#495057',
    fontSize: '1.25rem',
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#495057',
    fontSize: '1rem',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    boxSizing: 'border-box',
    fontSize: '1rem',
  },
  saveButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background 0.2s ease-in-out',
  },
  saveButtonHover: {
    backgroundColor: '#0056b3',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  loadButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    margin: '0 10px',
    transition: 'background 0.2s ease-in-out',
  },
  loadButtonHover: {
    backgroundColor: '#0056b3',
  },
  intentList: {
    maxHeight: '200px',
    overflowY: 'auto',
    margin: '20px 0',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#e9ecef',
  },
  intentListItem: {
    padding: '10px',
    borderBottom: '1px solid #ddd',
    cursor: 'pointer',
    transition: 'background 0.2s ease-in-out',
  },
  intentListItemHover: {
    backgroundColor: '#f1f3f5',
  },
  noIntentsText: {
    fontSize: '14px',
    color: '#6c757d',
  },
  errorText: {
    color: 'red',
    fontWeight: 'bold',
    marginTop: '10px',
  },
};

export default AdminPanel;
