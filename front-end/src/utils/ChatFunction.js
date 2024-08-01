const actionWords = [
  "make",
  "book",
  "schedule",
  "set",
  "get",
  "need",
  "want",
  "take",
  "nakhod",
  "ndir",
  "bghit",
  "bghyt",
];

const appointmentKeywords = [
  "rdv",
  "rendez",
  "vous",
  "موعد",
  "appointment",
  "booking",
  "schedule",
  "doctor",
  "physician",
  "clinic",
  "hospital",
  "medical",
  "checkup",
  "consultation",
  "tbib",
  "doktor",
  "docteur",
];

const arabicToLatinNumbers = (str) => {
  const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  const latinNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  return str.replace(
    /[٠-٩]/g,
    (char) => latinNumbers[arabicNumbers.indexOf(char)]
  );
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

const medicalWords = [
  "doctor",
  "physician",
  "clinic",
  "hospital",
  "medical",
  "checkup",
  "consultation",
  "tbib",
  "doktor",
];

export {
  medicalWords,
  languageChoices,
  generateRandomEmail,
  formatDateWithLatinNumbers,
  confirmYes,
  BookingDetailsData,
  arabicToLatinNumbers,
  actionWords,
  appointmentKeywords,
};
