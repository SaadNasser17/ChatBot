import React, { useState, useEffect } from 'react';

const specialtiesTranslation = {
  "anesthésie": { "ar": "تخدير", "fr": "anesthésie", "en": "Anesthesia" },
  "diabétologie nutritionnelle": { "ar": "التغذية وعلاج السكري", "fr": "diabétologie nutritionnelle", "en": "Diabetes Nutrition" },
  "endocrinologie": { "ar": "علم الغدد الصماء", "fr": "endocrinologie", "en": "Endocrinology" },
  "pédiatrie": { "ar": "طب الأطفال", "fr": "pédiatrie", "en": "Pediatrics" },
  "allergologie": { "ar": "طب الحساسية", "fr": "allergologie", "en": "Allergology" },
  "nutrition": { "ar": "تغذية", "fr": "nutrition", "en": "Nutrition" },
  "médecine générale": { "ar": "الطب العام", "fr": "médecine générale", "en": "General Medicine" },
  "médecine du sport": { "ar": "طب الرياضة", "fr": "médecine du sport", "en": "Sports Medicine" },
  "urologie": { "ar": "جراحة المسالك البولية", "fr": "urologie", "en": "Urology" },
  "chirurgie cardio": { "ar": "جراحة القلب", "fr": "chirurgie cardio", "en": "Cardiac Surgery" },
  "chirurgie vasculaire": { "ar": "جراحة الأوعية الدموية", "fr": "chirurgie vasculaire", "en": "Vascular Surgery" },
  "chirurgie général": { "ar": "الجراحة العامة", "fr": "chirurgie général", "en": "General Surgery" },
  "chirurgie orthopédiste": { "ar": "جراحة العظام", "fr": "chirurgie orthopédiste", "en": "Orthopedic Surgery" },
  "traumatologie": { "ar": "طب الإصابات", "fr": "traumatologie", "en": "Traumatology" },
  "orthopédie": { "ar": "جراحة العظام", "fr": "orthopédie", "en": "Orthopedics" },
  "médecine du travail": { "ar": "طب العمل", "fr": "médecine du travail", "en": "Occupational Medicine" },
  "gynécologie obstétrique": { "ar": "أمراض النساء والتوليد", "fr": "gynécologie obstétrique", "en": "Gynecology Obstetrics" },
  "dermatologie": { "ar": "طب الجلدية", "fr": "dermatologie", "en": "Dermatology" },
  "ophtalmologie": { "ar": "طب العيون", "fr": "ophtalmologie", "en": "Ophthalmology" },
  "pneumologie": { "ar": "طب الرئة", "fr": "pneumologie", "en": "Pulmonology" },
  "cardiologie": { "ar": "طب القلب", "fr": "cardiologie", "en": "Cardiology" },
  "chirurgie cancérologique": { "ar": "جراحة الأورام", "fr": "chirurgie cancérologique", "en": "Oncologic Surgery" },
  "néphrologie": { "ar": "طب الكلى", "fr": "néphrologie", "en": "Nephrology" },
  "médecine interne": { "ar": "الطب الباطني", "fr": "médecine interne", "en": "Internal Medicine" },
  "neuropsychiatrie": { "ar": "الطب النفسي العصبي", "fr": "neuropsychiatrie", "en": "Neuropsychiatry" },
  "psychiatrie": { "ar": "طب النفس", "fr": "psychiatrie", "en": "Psychiatry" },
  "oto-rhino-laryngologie": { "ar": "طب الأنف والأذن والحنجرة", "fr": "oto-rhino-laryngologie", "en": "ENT" },
  "chirurgie plastique": { "ar": "جراحة التجميل", "fr": "chirurgie plastique", "en": "Plastic Surgery" },
  "gastroentérologie": { "ar": "طب الجهاز الهضمي", "fr": "gastroentérologie", "en": "Gastroenterology" },
  "médecine physique et de réadaptation": { "ar": "الطب الفيزيائي وإعادة التأهيل", "fr": "médecine physique et de réadaptation", "en": "Physical Medicine and Rehabilitation" }
};

const customOrder = [
  "médecine générale", "pédiatrie", "gynécologie obstétrique", "cardiologie", "endocrinologie", "dermatologie", "ophtalmologie", "pneumologie", "psychiatrie", 
  "chirurgie orthopédiste", "traumatologie", "urologie", "gastroentérologie", "néphrologie", 
  "neuropsychiatrie", "oto-rhino-laryngologie", "chirurgie plastique", "anesthésie", "chirurgie vasculaire", "chirurgie général", "chirurgie cancérologique", "chirurgie cardio", "allergologie", "médecine du sport", 
  "diabétologie nutritionnelle", "nutrition", "médecine interne", "médecine physique et de réadaptation", "médecine du travail", "orthopédie"
];

const buttonTranslations = {
  darija: "Bghiti kter? ",
  "الدارجة": "بغيتي كتر؟",
  "العربية": "هل تريد المزيد؟",
  francais: "Voulez-vous plus?",
  english: "Do you want more?",
};

function SpecialtiesDropdown({ specialties, fetchDoctorsForSpecialty, selectedLanguage }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [orderedSpecialties, setOrderedSpecialties] = useState([]);

  useEffect(() => {
    const ordered = customOrder.map(name => specialties.find(s => s.name === name)).filter(Boolean);
    const remaining = specialties.filter(s => !customOrder.includes(s.name));
    setOrderedSpecialties([...ordered, ...remaining]);
  }, [specialties]);

  const handleShowMore = () => {
    setCurrentIndex((prevIndex) => Math.min(prevIndex + 3, orderedSpecialties.length));
  };

  const getSpecialtyTranslation = (specialty) => {
    if (selectedLanguage === 'darija' || selectedLanguage === 'francais') {
      return specialty.name;
    } else if (selectedLanguage === 'الدارجة' || selectedLanguage === 'العربية') {
      return specialtiesTranslation[specialty.name]?.ar || specialty.name;
    } else if (selectedLanguage === 'english') {
      return specialtiesTranslation[specialty.name]?.en || specialty.name;
    } else {
      return specialty.name;
    }
  };

  return (
    <div className="p-3 bg-light rounded-bottom overflow-hidden shadow-lg">
      <div className="d-flex flex-wrap justify-content-center">
        {orderedSpecialties.slice(currentIndex, currentIndex + 3).map((specialty) => (
          <button
            key={specialty.id}
            onClick={() => fetchDoctorsForSpecialty(specialty.name)}
            className="btn btn-info text-white m-1"
            style={{
              minWidth: "80px",
              maxWidth: "80px",
              whiteSpace: "normal",
              overflow: "hidden",
              textOverflow: "ellipsis",
              padding: "0.25rem 0.5rem",
              fontSize: "0.65rem",
              lineHeight: "0.85rem",
              height: "2.5rem",
              textAlign: "center",
            }}
          >
            {getSpecialtyTranslation(specialty)}
          </button>
        ))}
      </div>
      {currentIndex + 3 < orderedSpecialties.length && (
        <button
          onClick={handleShowMore}
          className="btn btn-success mt-2 text-xs mx-auto d-block"
        >
          {buttonTranslations[selectedLanguage]}
        </button>
      )}
    </div>
  );
  
}

export default SpecialtiesDropdown;
