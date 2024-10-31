import React, { useState, useEffect } from 'react';
import { Eye, Mic, ArrowLeft, ArrowRight, Download, CircleX } from 'lucide-react';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

function AdminPanel() {
  const [intents, setIntents] = useState({
    darija: { tag: '', pattern: '', response: '' },
    'الدارجة': { tag: '', pattern: '', response: '' },
    'العربية': { tag: '', pattern: '', response: '' },
    english: { tag: '', pattern: '', response: '' },
    francais: { tag: '', pattern: '', response: '' }
  });

  const [unrecognizedIntents, setUnrecognizedIntents] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0); // Main page carousel index
  const [popupIndex, setPopupIndex] = useState(0); // Popup carousel index
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [error, setError] = useState(null);
  const [showLanguages, setShowLanguages] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [dataset, setDataset] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false); // Flag to determine if updating intent
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch Unrecognized Intents from http://localhost:5000
    fetch('http://localhost:5000/unrecognized_intents')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setUnrecognizedIntents(data.unrecognized_intents);
      })
      .catch((error) => {
        console.error('There was an error fetching the unrecognized intents!', error);
        setError(error.message);
      });
  }, []);

  const languages = Object.keys(unrecognizedIntents);
  const currentLanguage = languages[currentIndex] || '';
  const popupLanguage = languages[popupIndex] || ''; // Popup-specific language
  const currentIntents = unrecognizedIntents[currentLanguage] || [];

  const handleInputChange = (language, field, value) => {
    setIntents((prevIntents) => ({
      ...prevIntents,
      [language]: { ...prevIntents[language], [field]: value }
    }));
  };

  const handleSave = (language) => {
    const payload = {
      tag: intents[language].tag,
      patterns: intents[language].pattern.split(',').map((p) => p.trim()),
      responses: intents[language].response.split(',').map((r) => r.trim())
    };

    const endpoint = isUpdating ? `/update_intent/${language}` : `/add_intent/${language}`;

    fetch(`http://localhost:5000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        alert(`Intent for ${language} ${isUpdating ? 'updated' : 'saved'}!`);
        setIsUpdating(false); // Reset after update
      })
      .catch((error) => {
        console.error(`There was an error ${isUpdating ? 'updating' : 'adding'} the intent!`, error);
        setError(error.message);
      });
  };

  const handleSaveAll = () => {
    Object.keys(intents).forEach((language) => {
      handleSave(language);
    });
    alert('All intents saved!');
  };

  const handleIgnoreIntent = (language, intent, e) => {
    e.stopPropagation();

    fetch(`http://localhost:5000/ignore_unrecognized_intent/${language}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pattern: intent })
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to ignore intent');
        }
        return response.json();
      })
      .then(() => {
        setUnrecognizedIntents((prevIntents) => {
          const updatedIntents = { ...prevIntents };
          updatedIntents[language] = updatedIntents[language].filter(i => i !== intent);
          return updatedIntents;
        });
        alert(`Intent "${intent}" ignored and removed from unrecognized intents!`);
      })
      .catch(error => {
        console.error('Error ignoring the intent:', error);
      });
  };

  const toggleLanguageButtons = () => {
    setShowLanguages(!showLanguages);
  };

  const startSpeechRecognition = (language, field) => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang =
      language === 'darija'
        ? 'ar-MA'
        : language === 'الدارجة'
        ? 'ar-MA'
        : language === 'العربية'
        ? 'ar-SA'
        : language === 'english'
        ? 'en-US'
        : 'fr-FR';

    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIntents((prevIntents) => ({
        ...prevIntents,
        [language]: { ...prevIntents[language], [field]: transcript }
      }));
    };

    recognition.start();
  };

  // Handlers for main page carousel (Unrecognized Intents)
  const nextIntent = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % languages.length);
  };

  const prevIntent = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + languages.length) % languages.length);
  };

  // Handlers for popup carousel (Dataset)
  const nextPopupIntent = () => {
    const nextIndex = (popupIndex + 1) % languages.length;
    setPopupIndex(nextIndex);
    loadDatasetForLanguage(languages[nextIndex]); // Load new dataset for the next language
  };

  const prevPopupIntent = () => {
    const prevIndex = (popupIndex - 1 + languages.length) % languages.length;
    setPopupIndex(prevIndex);
    loadDatasetForLanguage(languages[prevIndex]); // Load new dataset for the previous language
  };

  const loadDatasetForLanguage = (language) => {
    fetch(`http://localhost:5000/load_intents/${language}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setDataset(data.intents);
      })
      .catch((error) => {
        console.error('There was an error loading the intents!', error);
        setError(error.message);
      });
  };

  const handleWordClick = (word) => {
    setIntents((prevIntents) => ({
      ...prevIntents,
      [currentLanguage]: { ...prevIntents[currentLanguage], pattern: word }
    }));
  };

  const handleLanguageClick = (language) => {
    setSelectedLanguage(language);
    loadDatasetForLanguage(language); // Load dataset for the selected language
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleSelectIntent = (intent) => {
    setIntents((prevIntents) => ({
      ...prevIntents,
      [selectedLanguage]: {
        ...prevIntents[selectedLanguage],
        tag: intent.tag,
        pattern: intent.patterns.join(', '),
        response: intent.responses.join(', ')
      }
    }));
    setIsUpdating(true); // Set flag to true when updating an existing intent
    setShowPopup(false);
  };

  // Handle redirection from Statistiques to specific language table
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const targetLanguage = decodeURIComponent(hash.replace('#', ''));
      const targetIndex = languages.indexOf(targetLanguage);
      if (targetIndex !== -1) {
        setCurrentIndex(targetIndex);
        document.getElementById(targetLanguage)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [languages]);

  return (
    <div className="container mx-auto mt-10">
      <Header /> {/* Add the Header component here */}

      <div className="unrecognized-intents-container">
        <h2 className="text-center text-blue-600 mb-4">List of Unrecognized Intents</h2>
        <div className="relative w-full flex items-center">
          <button onClick={prevIntent} className="arrow-btn p-2 bg-gray-200 rounded-full hover:bg-gray-300 absolute left-0 z-10">
            <ArrowLeft />
          </button>

          <div className="intent-card p-4 mx-4 text-center w-full flex items-center flex-col">
            <h3 className="text-lg font-bold">{currentLanguage}</h3>
            <div className="intent-list-container w-full overflow-x-auto whitespace-nowrap p-4 bg-gray-100 rounded-md">
              {currentIntents.length === 0 ? (
                <p>Aucune intention a ete detectee</p>
              ) : (
                <ul className="intent-list flex gap-x-4">
                  {currentIntents.map((intent, index) => (
                    <li
                      key={index}
                      className="intent-item inline-block py-1 bg-white shadow-md rounded-full px-4 py-2 cursor-pointer hover:bg-gray-200 flex items-center"
                      onClick={() => handleWordClick(intent)}
                    >
                      {intent}
                      <button
                        className="ml-2 text-red-500 hover:text-red-700"
                        onClick={(e) => handleIgnoreIntent(currentLanguage, intent, e)}
                      >
                        <CircleX />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <button onClick={nextIntent} className="arrow-btn p-2 bg-gray-200 rounded-full hover:bg-gray-300 absolute right-0 z-10">
            <ArrowRight />
          </button>
        </div>
      </div>

      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th
              className="border text-center p-2 relative group"
            >
              Language
              <div id="tooltip-language" role="tooltip" className="tooltip-class hidden group-hover:block absolute top-full mt-1 bg-gray-700 text-white text-sm p-2 rounded">
                selection de langue
              </div>
            </th>
            <th
              className="border text-center p-2 relative group"
            >
              Tag
              <div id="tooltip-tag" role="tooltip" className="tooltip-class hidden group-hover:block absolute top-full mt-1 bg-gray-700 text-white text-sm p-2 rounded">
                titre de l'intention
              </div>
            </th>
            <th
              className="border text-center p-2 relative group"
            >
              Pattern
              <div id="tooltip-pattern" role="tooltip" className="tooltip-class hidden group-hover:block absolute top-full mt-1 bg-gray-700 text-white text-sm p-2 rounded">
                message/input du patient
              </div>
            </th>
            <th
              className="border text-center p-2 relative group"
            >
              Response
              <div id="tooltip-response" role="tooltip" className="tooltip-class hidden group-hover:block absolute top-full mt-1 bg-gray-700 text-white text-sm p-2 rounded">
                reponse de nabadybot
              </div>
            </th>
            <th
              className="border text-center p-2 relative group"
            >
              Action
              <div id="tooltip-action" role="tooltip" className="tooltip-class hidden group-hover:block absolute top-full mt-1 bg-gray-700 text-white text-sm p-2 rounded">
                ajouter ou modifier
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(intents).map(([language, intent], index) => (
            <tr key={language} id={language} className="text-center border-t">
              <td className="border-r border-b p-2">{language}</td>
              <td className="p-2">
                <div className="flex items-center">
                  <input
                    type="text"
                    value={intent.tag}
                    onChange={(e) => handleInputChange(language, 'tag', e.target.value)}
                    className="border p-1 w-full bg-white"
                    placeholder="Enter tag"
                  />
                  <button
                    onClick={() => startSpeechRecognition(language, 'tag')}
                    className="ml-2 bg-gray-200 p-1 rounded-full hover:bg-gray-300"
                  >
                    <Mic />
                  </button>
                </div>
              </td>
              <td className="p-2">
                <div className="flex items-center">
                  <input
                    type="text"
                    value={intent.pattern}
                    onChange={(e) => handleInputChange(language, 'pattern', e.target.value)}
                    className="border p-1 w-full bg-white"
                    placeholder="Enter pattern"
                  />
                  <button
                    onClick={() => startSpeechRecognition(language, 'pattern')}
                    className="ml-2 bg-gray-200 p-1 rounded-full hover:bg-gray-300"
                  >
                    <Mic />
                  </button>
                </div>
              </td>
              <td className="p-2">
                <div className="flex items-center">
                  <input
                    type="text"
                    value={intent.response}
                    onChange={(e) => handleInputChange(language, 'response', e.target.value)}
                    className="border p-1 w-full bg-white"
                    placeholder="Enter response"
                  />
                  <button
                    onClick={() => startSpeechRecognition(language, 'response')}
                    className="ml-2 bg-gray-200 p-1 rounded-full hover:bg-gray-300"
                  >
                    <Mic />
                  </button>
                </div>
              </td>
              <td className="p-2">
                <button
                  onClick={() => handleSave(language)}
                  className="bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-700"
                >
                  <Download />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleSaveAll}
          className="bg-green-500 text-white py-2 px-6 rounded hover:bg-green-700 flex items-center"
        >
          <Download className="mr-2" /> Save All
        </button>
      </div>

      <div className="mt-4 flex items-center">
        <button onClick={toggleLanguageButtons} className="bg-gray-300 text-gray-800 p-2 rounded-full hover:bg-gray-400">
          <Eye />
        </button>
        {showLanguages && (
          <div className="ml-4 flex space-x-2">
            <button className="bg-gray-200 p-2 rounded hover:bg-gray-300" onClick={() => navigate(`/admin#${encodeURIComponent('darija')}`)}>
              dr
            </button>
            <button className="bg-gray-200 p-2 rounded hover:bg-gray-300" onClick={() => navigate(`/admin#${encodeURIComponent('الدارجة')}`)}>
              در
            </button>
            <button className="bg-gray-200 p-2 rounded hover:bg-gray-300" onClick={() => navigate(`/admin#${encodeURIComponent('العربية')}`)}>
              ar
            </button>
            <button className="bg-gray-200 p-2 rounded hover:bg-gray-300" onClick={() => navigate(`/admin#${encodeURIComponent('english')}`)}>
              en
            </button>
            <button className="bg-gray-200 p-2 rounded hover:bg-gray-300" onClick={() => navigate(`/admin#${encodeURIComponent('francais')}`)}>
              fr
            </button>
          </div>
        )}
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/2 max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center sticky top-0 bg-white p-4">
              <button onClick={prevPopupIntent} className="p-2 text-black hover:bg-gray-100 rounded-full">
                <ArrowLeft />
              </button>
              <h2 className="text-xl text-center flex-1 font-bold">Dataset for {popupLanguage}</h2>
              <button onClick={nextPopupIntent} className="p-2 text-black hover:bg-gray-100 rounded-full">
                <ArrowRight />
              </button>
              <button onClick={closePopup} className="p-2 text-black hover:bg-gray-100 rounded-full absolute right-0.5 top-0">
                <CircleX />
              </button>
            </div>

            <hr className="border-black my-2" />

            <div className="overflow-y-auto max-h-[60vh] p-4">
              <ul>
                {dataset?.map((intent, idx) => (
                  <li
                    key={idx}
                    className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                    onClick={() => handleSelectIntent(intent)}
                  >
                    <strong>Tag:</strong> {intent.tag} <br />
                    <strong>Patterns:</strong> {intent.patterns.join(', ')} <br />
                    <strong>Responses:</strong> {intent.responses.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
