// import React, { useState } from "react";

// function SpecialtiesDropdown({ specialties, fetchDoctorsForSpecialty }) {
//   const [lastDisplayedIndex, setLastDisplayedIndex] = useState(2);

//   const displaySpecialties = (startIndex, endIndex) => {
//     const visibleSpecialties = specialties.slice(startIndex, endIndex + 1);
//     return visibleSpecialties.map((specialty, index) => (
//       <button
//         key={index}
//         onClick={() => fetchDoctorsForSpecialty(specialty.name)}
//       >
//         {specialty.name}
//       </button>
//     ));
//   };

//   const handleShowMore = () => {
//     const newIndex = Math.min(lastDisplayedIndex + 3, specialties.length);
//     setLastDisplayedIndex(newIndex);
//   };

//   return (
//     <>
//       <div className="select-container bg-orange-700 ">
//         {displaySpecialties(0, lastDisplayedIndex)}
//         {lastDisplayedIndex < specialties.length && (
//           <button onClick={handleShowMore} className="bg-blue-500">
//             Chno mazal kayn?
//           </button>
//         )}
//       </div>
//     </>
//   );
// }

// export default SpecialtiesDropdown;

// // import React, { useState } from "react";

// // function SpecialtiesDropdown({ specialties, fetchDoctorsForSpecialty }) {
// //   const [lastDisplayedIndex, setLastDisplayedIndex] = useState(2);

// //   // Function to render visible specialties
// //   const displaySpecialties = (startIndex, endIndex) => {
// //     const visibleSpecialties = specialties.slice(startIndex, endIndex + 1);
// //     return visibleSpecialties.map((specialty, index) => (
// //       <button
// //         key={index} // Consider using a unique ID if available instead of index
// //         onClick={() => fetchDoctorsForSpecialty(specialty)}
// //         className="bg-white text-black p-2 m-1 rounded hover:bg-gray-200" // Styling to fit the chat theme
// //       >
// //         {specialty.name}
// //       </button>
// //     ));
// //   };

// //   // Function to handle 'Show More' button click
// //   const handleShowMore = () => {
// //     const newIndex = Math.min(lastDisplayedIndex + 3, specialties.length);
// //     setLastDisplayedIndex(newIndex);
// //   };

// //   return (
// //     <div className="select-container p-3 bg-blue-500 rounded-b-xl overflow-hidden shadow-lg">
// //       {displaySpecialties(0, lastDisplayedIndex)}
// //       {lastDisplayedIndex < specialties.length && (
// //         <button
// //           onClick={handleShowMore}
// //           className="bg-picton-blue-500 hover:bg-persian-green-600 text-white p-2 rounded mt-2" // Consistent button styling with the chatbox
// //         >
// //           Show More
// //         </button>
// //       )}
// //     </div>
// //   );
// // }

// // export default SpecialtiesDropdown;

import React, { useState } from "react";

function SpecialtiesDropdown({ specialties, fetchDoctorsForSpecialty }) {
  const [lastDisplayedIndex, setLastDisplayedIndex] = useState(2);

  const displaySpecialties = (startIndex, endIndex) => {
    const visibleSpecialties = specialties.slice(startIndex, endIndex + 1);
    return visibleSpecialties.map((specialty) => (
      <>
      
      <button
        key={specialty.id} 
        onClick={() => fetchDoctorsForSpecialty(specialty.name)}
        className="bg-picton-blue-500 opacity-40 text-white p-1 m-1 rounded-lg hover:bg-persian-green-500"
      >
        {specialty.name}
      </button>
      </>
    ));
  };

  const handleShowMore = () => {
    setLastDisplayedIndex(prevIndex => Math.min(prevIndex + 3, specialties.length));
  };

  return (
    <div className=" p-3 bg-black-squeeze rounded-b-xl overflow-hidden shadow-lg"> 
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
