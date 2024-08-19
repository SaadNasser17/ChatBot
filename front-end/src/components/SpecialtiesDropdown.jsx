import React, { useState, useEffect } from "react";
import {
  buttonTranslations,
  customOrder,
  specialtiesTranslation,
} from "../utils/specialtiesTranslation";

specialtiesTranslation;
customOrder;
buttonTranslations;

function SpecialtiesDropdown({
  specialties,
  fetchDoctorsForSpecialty,
  selectedLanguage,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [orderedSpecialties, setOrderedSpecialties] = useState([]);

  useEffect(() => {
    const ordered = customOrder
      .map((name) => specialties.find((s) => s.name === name))
      .filter(Boolean);
    const remaining = specialties.filter((s) => !customOrder.includes(s.name));
    setOrderedSpecialties([...ordered, ...remaining]);
  }, [specialties]);

  const handleShowMore = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(prevIndex + 3, orderedSpecialties.length)
    );
  };

  const getSpecialtyTranslation = (specialty) => {
    if (selectedLanguage === "darija" || selectedLanguage === "francais") {
      return specialty.name;
    } else if (
      selectedLanguage === "الدارجة" ||
      selectedLanguage === "العربية"
    ) {
      return specialtiesTranslation[specialty.name]?.ar || specialty.name;
    } else if (selectedLanguage === "english") {
      return specialtiesTranslation[specialty.name]?.en || specialty.name;
    } else {
      return specialty.name;
    }
  };

  return (
    <div className="p-3 rounded-bottom overflow-hidden " style={{backgroundColor: "#fdfefe"}}>
      <div className="d-flex flex-wrap justify-content-center">
        {orderedSpecialties
          .slice(currentIndex, currentIndex + 3)
          .map((specialty) => (
            <button
              key={specialty.id}
              onClick={() => fetchDoctorsForSpecialty(specialty.name)}
              className="btn text-white m-1"
              style={{
                backgroundColor: "#5dade2",
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
                marginTop:'0.5rem'
              }}
            >
              {getSpecialtyTranslation(specialty)}
            </button>
          ))}
      </div>
      {currentIndex + 3 < orderedSpecialties.length && (
        <button
          onClick={handleShowMore}
          className="btn  mt-2 text-xs mx-auto d-block"
          style={{
            backgroundColor: "#eaeded",
            borderColor: "#00a99d",
            marginTop: "0.5rem",
          }}
        >
          {buttonTranslations[selectedLanguage]}
        </button>
      )}
    </div>
  );
}

export default SpecialtiesDropdown;
