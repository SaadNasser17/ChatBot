import React, { useState, useEffect } from 'react';

const specialtiesTranslation = {
    "anesthésie": "تخدير",
    "diabétologie nutritionnelle": "التغذية وعلاج السكري",
    "endocrinologie": "علم الغدد الصماء",
    "pédiatrie": "طب الأطفال",
    "allergologie": "طب الحساسية",
    "nutrition": "تغذية",
    "médecine générale": "الطب العام",
    "médecine du sport": "طب الرياضة",
    "urologie": "جراحة المسالك البولية",
    "chirurgie cardio": "جراحة القلب",
    "chirurgie vasculaire": "جراحة الأوعية الدموية",
    "chirurgie général": "الجراحة العامة",
    "chirurgie orthopédiste": "جراحة العظام",
    "traumatologie": "طب الإصابات",
    "orthopédie": "جراحة العظام",
    "médecine du travail": "طب العمل",
    "gynécologie obstétrique": "أمراض النساء والتوليد",
    "dermatologie": "طب الجلدية",
    "ophtalmologie": "طب العيون",
    "pneumologie": "طب الرئة",
    "cardiologie": "طب القلب",
    "chirurgie cancérologique": "جراحة الأورام",
    "néphrologie": "طب الكلى",
    "médecine interne": "الطب الباطني",
    "neuropsychiatrie": "الطب النفسي العصبي",
    "psychiatrie": "طب النفس",
    "oto-rhino-laryngologie": "طب الأنف والأذن والحنجرة",
    "chirurgie plastique": "جراحة التجميل",
    "gastroentérologie": "طب الجهاز الهضمي",
    "médecine physique et de réadaptation": "الطب الفيزيائي وإعادة التأهيل"
};

const customOrder = [
  "médecine générale", "pédiatrie", "gynécologie obstétrique", "cardiologie", "endocrinologie", "dermatologie", "ophtalmologie", "pneumologie", "psychiatrie", 
  "chirurgie orthopédiste", "traumatologie", "urologie", "gastroentérologie", "néphrologie", 
  "neuropsychiatrie", "oto-rhino-laryngologie", "chirurgie plastique", "anesthésie", "chirurgie vasculaire", "chirurgie générale", "chirurgie cancérologique", "chirurgie cardio", "allergologie", "médecine du sport", 
  "diabétologie nutritionnelle", "nutrition", "médecine interne", "médecine physique et de réadaptation", "médecine du travail", "orthopédie"
];

function SpecialtiesDropdown({ specialties, fetchDoctorsForSpecialty }) {
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

  return (
    <div className="p-3 bg-black-squeeze rounded-b-xl overflow-hidden shadow-lg">
      <div className="flex space-x-2">
        {orderedSpecialties.slice(currentIndex, currentIndex + 3).map((specialty) => (
          <button
            key={specialty.id}
            onClick={() => fetchDoctorsForSpecialty(specialty.name)}
            className="text-white p-1 rounded-lg hover:bg-persian-green-500"
            style={{
              backgroundColor: "#87CEEB", // Bleu ciel
              minWidth: "80px",
              maxWidth: "80px",
              whiteSpace: "normal",
              overflow: "hidden",
              textOverflow: "ellipsis",
              padding: "0.25rem 0.5rem",
              fontSize: "0.65rem",  // Petite taille de police
              lineHeight: "0.85rem",  // Hauteur de ligne pour ajuster l'espacement
              height: "2.5rem",  // Hauteur fixe pour uniformité
              textAlign: "center",  // Centrer le texte
            }}
          >
            {specialtiesTranslation[specialty.name] || specialty.name}
          </button>
        ))}
      </div>
      {currentIndex + 3 < orderedSpecialties.length && (
        <button
          onClick={handleShowMore}
          className="bg-persian-green-500 hover:bg-teal-600 text-white p-1 rounded mt-2 text-xs"
        >
          بغيتي كتر؟
        </button>
      )}
    </div>
  );
}

export default SpecialtiesDropdown;
