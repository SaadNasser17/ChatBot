import React, { useState, useEffect } from 'react';

function IntentDetails({ intent, setSelectedIntent, removeIntentFromList }) {
  const [response, setResponse] = useState('');
  const [tag, setTag] = useState('');
  const [error, setError] = useState(null);

  // This will ensure that the intent object is valid before using it
  useEffect(() => {
    if (intent) {
      setTag(intent.tag || '');
      setResponse(intent.response || '');
    }
  }, [intent]);

  const handleSave = () => {
    if (!intent || !intent.words) {
      setError("Invalid intent data");
      return;
    }

    const selectedLanguage = intent.language;
    const payload = {
      tag,
      patterns: intent.words.join(','), // Ensure intent.words is an array of unrecognized words
      responses: response
    };

    fetch(`http://localhost:5000/add_intent/${selectedLanguage}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        alert('Intent added successfully!');
        removeIntentFromList(intent);
        setSelectedIntent(null);
      })
      .catch(error => {
        console.error('There was an error adding the intent!', error);
        setError(error.message);
      });
  };

  if (!intent || !intent.words) {
    return <div>No valid intent selected</div>;
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Intent: {intent.words.join(', ')}</h3>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <div>
        <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Tag:</label>
        <input
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Response:</label>
        <input
          type="text"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
        />
      </div>
      <button
        onClick={handleSave}
        style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
      >
        Save
      </button>
    </div>
  );
}

export default IntentDetails;
