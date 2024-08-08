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
        // Convert the array of words to an array of objects with a 'words' property
        const formattedIntents = Object.entries(data.unrecognized_intents).reduce((acc, [language, words]) => {
          acc[language] = words.map(word => ({ words: [word] }));
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
      patterns: newIntent[language].patterns,
      responses: newIntent[language].responses,
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
        setSelectedIntent(null); // Reset the selected intent
      })
      .catch(error => {
        console.error('There was an error adding the new intent!', error);
        setError(error.message);
      });
  };

  const removeIntentFromList = (intent) => {
    setUnrecognizedIntents(prev => {
      const newIntents = { ...prev };
      newIntents[intent.language] = newIntents[intent.language].filter(i => i !== intent);
      return newIntents;
    });
  };

  return (
    <div style={{ width: '90%', maxWidth: '1200px', margin: '20px auto', backgroundColor: '#fff', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', padding: '20px', borderRadius: '8px' }}>
      <div style={{ backgroundColor: '#0dcaf0', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
        <h1 style={{ color: '#333' }}>NABADYBOT ADMIN</h1>
      </div>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <div style={{ marginTop: '20px' }}>
        <h2 style={{ color: '#007bff' }}>List of unrecognized intents</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {Object.entries(unrecognizedIntents).map(([language, intents]) => (
            <div key={language} style={{ flex: 1, margin: '0 10px' }}>
              <h3>{language}</h3>
              {intents.length > 0 ? (
                <ul style={{ maxHeight: '200px', overflowY: 'auto', margin: '20px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
                  {intents.map((intent, index) => (
                    <li
                      key={index}
                      style={{ padding: '10px', borderBottom: '1px solid #ddd', cursor: 'pointer' }}
                      onClick={() => setSelectedIntent({ ...intent, language })}
                    >
                      {intent.words.join(', ')}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No unrecognized intents found for {language}.</p>
              )}
            </div>
          ))}
        </div>
      </div>
      {selectedIntent && (
        <IntentDetails
          intent={selectedIntent}
          setSelectedIntent={setSelectedIntent}
          removeIntentFromList={removeIntentFromList}
        />
      )}

      <h2 style={{ color: '#007bff', marginTop: '30px' }}>Add New Intent</h2>
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        {Object.entries(newIntent).map(([language, intent], index) => (
          <div key={index} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <h3>{language}</h3>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Tag</label>
              <input
                type="text"
                value={intent.tag}
                onChange={(e) => setNewIntent({ ...newIntent, [language]: { ...intent, tag: e.target.value } })}
                style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Patterns</label>
              <input
                type="text"
                value={intent.patterns}
                onChange={(e) => setNewIntent({ ...newIntent, [language]: { ...intent, patterns: e.target.value } })}
                style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Responses</label>
              <input
                type="text"
                value={intent.responses}
                onChange={(e) => setNewIntent({ ...newIntent, [language]: { ...intent, responses: e.target.value } })}
                style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>
            <button
              onClick={() => handleAddIntent(language)}
              style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
            >
              Save
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPanel;