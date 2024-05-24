import React, { useState } from 'react';

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
    "chirurgie générale": "الجراحة العامة",
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

function SpecialtiesDropdown({ specialties, fetchDoctorsForSpecialty }) {
  const [lastDisplayedIndex, setLastDisplayedIndex] = useState(2);

  const displaySpecialties = (startIndex, endIndex) => {
    const visibleSpecialties = specialties.slice(startIndex, endIndex + 1);
    console.log(visibleSpecialties); // Ajoutez cette ligne pour vérifier les noms de spécialités
    return visibleSpecialties.map((specialty) => (
      <button
        key={specialty.id}
        onClick={() => fetchDoctorsForSpecialty(specialty.name)}
        className="bg-picton-blue-500 opacity-40 text-white p-1 m-1 rounded-lg hover:bg-persian-green-500"
      >
        {specialtiesTranslation[specialty.name] || specialty.name}
      </button>
    ));
  };


  const handleShowMore = () => {
    setLastDisplayedIndex((prevIndex) =>
      Math.min(prevIndex + 3, specialties.length)
    );
  };

  return (
    <div className="p-3 bg-black-squeeze rounded-b-xl overflow-hidden shadow-lg">
      {displaySpecialties(0, lastDisplayedIndex)}
      {lastDisplayedIndex < specialties.length && (
        <button
          onClick={handleShowMore}
          className="bg-picton-blue-500 hover:bg-persian-green-600 text-white p-1 rounded mt-2 text-sm"
        >
          bghiti ktr?
        </button>
      )}
    </div>
  );
}

export default SpecialtiesDropdown;
