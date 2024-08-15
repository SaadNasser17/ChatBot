import React, { useState, useEffect } from 'react';

function IntentDetails({ intent, setSelectedIntent, removeIntentFromList, updateExistingIntents }) {
  const [tag, setTag] = useState('');
  const [patterns, setPatterns] = useState('');
  const [responses, setResponses] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (intent) {
      setTag(intent.tag || '');
      setPatterns(intent.words ? intent.words.join(', ') : '');
      setResponses(intent.responses ? intent.responses.join(', ') : '');
    }
  }, [intent]);

  const handleSave = () => {
    if (!intent) {
      setError("Invalid intent data");
      return;
    }

    const payload = {
      tag,
      patterns: patterns.split(',').map(pat => pat.trim()),
      responses: responses.split(',').map(res => res.trim())
    };

    fetch(`http://localhost:5000/update_intent/${intent.language}`, {
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
        alert(intent.isUnrecognized ? 'Intent added successfully!' : 'Intent updated successfully!');
        if (intent.isUnrecognized) {
          removeIntentFromList(intent);
        } else {
          updateExistingIntents(intent.language);
        }
        setSelectedIntent(null);
      })
      .catch(error => {
        console.error('There was an error saving the intent!', error);
        setError(error.message);
      });
  };

  if (!intent) {
    return <div>No valid intent selected</div>;
  }

  return (
    <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
      <h3>Edit Intent: {intent.isUnrecognized ? 'New Intent' : intent.tag}</h3>
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
        <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Patterns (comma-separated):</label>
        <input
          type="text"
          value={patterns}
          onChange={(e) => setPatterns(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Responses (comma-separated):</label>
        <input
          type="text"
          value={responses}
          onChange={(e) => setResponses(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
        />
      </div>
      <button
        onClick={handleSave}
        style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginRight: '10px' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
      >
        Save
      </button>
      <button
        onClick={() => setSelectedIntent(null)}
        style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
      >
        Cancel
      </button>
    </div>
  );
}

export default IntentDetails;
