// Fetch words from the backend instead of MongoDB directly
const fetchWordsFromBackend = async () => {
  try {
    const response = await fetch('http://localhost:5000/get_word_lists');
    if (!response.ok) {
      throw new Error('Failed to fetch word lists');
    }
    const data = await response.json();
    return data; // Contains actionWords, appointmentKeywords, medicalWords
  } catch (error) {
    console.error('Error fetching word lists from backend:', error);
    return { actionWords: [], appointmentKeywords: [], medicalWords: [] }; // Return empty lists if error
  }
};

// Initialize the words from the backend for the chatbot logic
const initWordLists = async () => {
  const { actionWords, appointmentKeywords, medicalWords } = await fetchWordsFromBackend();
  return { actionWords, appointmentKeywords, medicalWords };
};

// Other utility functions remain unchanged
const arabicToLatinNumbers = (str) => {
  const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  const latinNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  return str.replace(/[٠-٩]/g, (char) => latinNumbers[arabicNumbers.indexOf(char)]);
};

const BookingDetailsData = {
  doctorName: "",
  PcsID: "",
  timeSlot: "",
  first_name: "",
  last_name: "",
  phone_number: "",
  email: "",
};

const confirmYes = {
  darija: "ah",
  الدارجة: "نعم",
  العربية: "نعم",
  francais: "oui",
  english: "yes",
};

const formatDateWithLatinNumbers = (date) => {
  const options = { day: "2-digit", month: "2-digit" };
  const formattedDate = date.toLocaleDateString("en-GB", options); // Use 'en-GB' for DD/MM/YYYY format
  return arabicToLatinNumbers(formattedDate);
};

const generateRandomEmail = () => {
  const randomChars = Math.random().toString(36).substring(2, 10);
  return `${randomChars}@yopmail.com`;
};

const languageChoices = {
  1: "darija",
  darija: "darija",
  2: "الدارجة",
  الدارجة: "الدارجة",
  3: "العربية",
  العربية: "العربية",
  4: "francais",
  francais: "francais",
  5: "english",
  english: "english",
};

export {
  initWordLists, // Export the function to initialize word lists from the backend
  languageChoices,
  generateRandomEmail,
  formatDateWithLatinNumbers,
  confirmYes,
  BookingDetailsData,
  arabicToLatinNumbers,
};
