import React, { useState } from "react";

function SpecialtiesDropdown({ specialties, fetchDoctorsForSpecialty }) {
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);

  const displaySpecialties = (startIndex, endIndex) => {
    const visibleSpecialties = specialties.slice(startIndex, endIndex);
    return visibleSpecialties.map((specialty) => (
<<<<<<< HEAD
      <>
<<<<<<< HEAD
=======
      <p>n3awnek</p>
=======
>>>>>>> 1c475fe0636e8a7aa75660aca993c85297832ce3
>>>>>>> master
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
    // Calculate the new start index for the next set of specialties
    const newStartIndex = visibleStartIndex + 3;
    // Update the start index only if it does not exceed the list length
    if (newStartIndex < specialties.length) {
      setVisibleStartIndex(newStartIndex);
    }
  };

  return (
    <div className="p-3 bg-black-squeeze rounded-b-xl overflow-hidden shadow-lg"> 
      {displaySpecialties(visibleStartIndex, visibleStartIndex + 3)}
      {visibleStartIndex + 3 < specialties.length && (
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

