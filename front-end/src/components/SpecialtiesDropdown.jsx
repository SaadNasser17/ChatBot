import React, { useState } from 'react';

function SpecialtiesDropdown({ specialties, fetchDoctorsForSpecialty }) {
  const [lastDisplayedIndex, setLastDisplayedIndex] = useState(2);

  const displaySpecialties = (startIndex, endIndex) => {
    const visibleSpecialties = specialties.slice(startIndex, endIndex + 1);
    return visibleSpecialties.map((specialty) => (
      <button
        key={specialty.id}
        onClick={() => fetchDoctorsForSpecialty(specialty.name)}
        className="bg-picton-blue-500 opacity-40 text-white p-1 m-1 rounded-lg hover:bg-persian-green-500"
      >
        {specialty.name}
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
