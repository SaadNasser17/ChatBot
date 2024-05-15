// import React, { useState, useEffect } from 'react';
// import useEmblaCarousel from 'embla-carousel-react'

// function SpecialtiesDropdown({ specialties, fetchDoctorsForSpecialty }) {
//   const [visibleStartIndex, setVisibleStartIndex] = useState(0);
//   const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

//   useEffect(() => {
//     if (emblaApi) {
//       // Initializes or updates the Embla Carousel when the doctors data changes
//       emblaApi.reInit();
//     }
//   }, [doctors, emblaApi]);

//   const displaySpecialties = (startIndex, endIndex) => {
//     const visibleSpecialties = specialties.slice(startIndex, endIndex);
//     return visibleSpecialties.map((specialty) => (

//       <button
//         key={specialty.id} 
//         onClick={() => fetchDoctorsForSpecialty(specialty.name)}
//         className="bg-picton-blue-500 opacity-40 text-white p-1 m-1 rounded-lg hover:bg-persian-green-500"
//       >
//         {specialty.name}
//       </button>
//     ));
//   };

//   const handleShowMore = () => {
//     // Calculate the new start index for the next set of specialties
//     const newStartIndex = visibleStartIndex + 3;
//     // Update the start index only if it does not exceed the list length
//     if (newStartIndex < specialties.length) {
//       setVisibleStartIndex(newStartIndex);
//     }
//   };

//   return (
//     <div className="p-3 bg-black-squeeze rounded-b-xl overflow-hidden shadow-lg"> 
//       {displaySpecialties(visibleStartIndex, visibleStartIndex + 3)}
//       {visibleStartIndex + 3 < specialties.length && (
//         <button
//           onClick={handleShowMore}
//           className="bg-picton-blue-500 hover:bg-persian-green-600 text-white p-1 rounded mt-2 text-sm"
//         >
//           bghiti ktr?
//         </button>
//       )}
//     </div>
//   );
// }

// export default SpecialtiesDropdown;

import React, { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react'

function SpecialtiesDropdown({ specialties, fetchDoctorsForSpecialty }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    containScroll: 'keepSnaps',
    draggable: true,
    slidesToScroll: 3
  });

  useEffect(() => {
    if (emblaApi) {
      // Reinitialize the Embla Carousel whenever the specialties list changes
      emblaApi.reInit();
    }
  }, [specialties, emblaApi]);

  return (
    <div className="p-3 bg-black-squeeze rounded-b-xl overflow-hidden shadow-lg">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {specialties.map((specialty) => (
            <div className="embla__slide" key={specialty.id}>
              <button
                onClick={() => fetchDoctorsForSpecialty(specialty.name)}
                className="bg-picton-blue-500 opacity-40 text-white p-1 m-1 rounded-lg hover:bg-persian-green-500"
              >
                {specialty.name}
              </button>
            </div>
          ))}
        </div>
      </div>
      {specialties.length > 3 && emblaApi && (
        <button
          onClick={() => emblaApi.scrollNext()}
          className="bg-picton-blue-500 hover:bg-persian-green-600 text-white p-1 rounded mt-2 text-sm"
        >
          bghiti ktr?
        </button>
      )}
    </div>
  );
}

export default SpecialtiesDropdown;
