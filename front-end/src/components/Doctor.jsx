// import React, { useState, useEffect } from "react";
// import useEmblaCarousel from "embla-carousel-react";

// function Doctor({ specialty }) {
//   const [doctors, setDoctors] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [currentSpecialty, setCurrentSpecialty] = useState("");
//   const [emblaRef, emblaApi] = useEmblaCarousel({
//     loop: false,
//     align: 'start'
//   });

//   useEffect(() => {
//     if (specialty) {
//       fetchDoctorsForSpecialty(specialty);
//     }
//   }, [specialty]);

//    useEffect(() => {
//     if (emblaApi && doctors.length > 0) {
//       // Ensure the carousel is updated when doctors change
//       console.log('Reinitializing carousel due to doctors change');
//       emblaApi.reInit();
//     }
//   }, [doctors, emblaApi]);

//   const fetchDoctorsForSpecialty = async (specialtyName) => {
//     setCurrentSpecialty(specialtyName);

//     setLoading(true);
//     try {
//       const response = await fetch(
//         "https://apiuat.nabady.ma/api/users/medecin/search",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             query: specialtyName,
//             consultation: "undefined",
//             page: 1,
//             result: 5,
//             isIframe: false,
//             referrer: "",
//           }),
//         }
//       );
//       if (!response.ok) throw new Error("Network response was not ok.");
//       const data = await response.json();
//       displayDoctors(data.praticien.data);
//     } catch (error) {
//       console.log("Error fetching doctors:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const displayDoctors = (doctorData) => {
//     const filteredDoctors = doctorData
//       .map((item) => {
//         const doctor = item["0"];
//         return {
//           name: `Dr. ${doctor.lastname} ${doctor.firstname}`,
//           tel: doctor.tel,
//           email: doctor.email,
//           address: doctor.adresse,
//           agendaConfig: doctor.praticienCentreSoins[0].agendaConfig,
//         };
//       })
//       .filter((doctor) => hasAvailableSlots(doctor.agendaConfig));
//     setDoctors(filteredDoctors);
//   };

//   const hasAvailableSlots = (agendaConfig) => {
//     const now = new Date();
//     const closingTime = new Date();
//     closingTime.setHours(
//       parseInt(agendaConfig.heureFermeture.split(":")[0], 10),
//       parseInt(agendaConfig.heureFermeture.split(":")[1], 10),
//       0
//     );
//     return now < closingTime;
//   };

//   const createAgendaGrid = (agendaConfig) => {
//     const now = new Date();
//     const currentTime = `${now.getHours()}:${now
//       .getMinutes()
//       .toString()
//       .padStart(2, "0")}`;

//     const { heureOuverture, heureFermeture } = agendaConfig;
//     const openingHour = parseInt(heureOuverture.split(":")[0], 10);
//     const closingHour = parseInt(heureFermeture.split(":")[0], 10);
//     const slots = [];

//     for (let hour = openingHour; hour < closingHour; hour++) {
//       slots.push(`${hour}:00`);
//       slots.push(`${hour}:30`);
//     }

//     const filteredSlots = slots
//       .filter((slot) => {
//         const slotDate = new Date(now.toDateString() + " " + slot);
//         return slotDate >= now;
//       })
//       .slice(0, 5);

//     return (
//       <div className="embla" ref={emblaRef}>
//         <span className="text-lg boold">Sway3 li mojodin:</span>
//         <div className="embla__container">
//           {filteredSlots.map((slot, index) => (
//             <div className="embla__slide" key={index}>
//               <button
//                 onClick={() => handleSlotClick(slot)}
//                 className="btn btn-primary my-2"
//               >
//                 {slot}
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   const handleSlotClick = (slot) => {
//     console.log("Slot selected:", slot);
//   };

//   return (
//     <div className="rounded-lg p-4">
//       {loading && (
//         <p className="text-blue-500">hana kn9alab f {currentSpecialty}</p>
//       )}
//       {doctors.map((doctor, index) => (
//         <div
//           key={index}
//           className="mb-2 p-2 border rounded-lg hover:bg-gray-100"
//         >
//           <strong className="font-semibold">{doctor.name}</strong>
//           <br />
//           <span className="text-sm text-gray-700">Tel: {doctor.tel}</span>
//           <br />
//           <span className="text-sm text-gray-700">
//             Email:
//             <a
//               href={`mailto:${doctor.email}`}
//               className="text-blue-500 hover:text-blue-700 underline"
//             >
//               {doctor.email}
//             </a>
//           </span>
//           <br />
//           <span className="text-sm text-gray-700">
//             Address: {doctor.address}
//           </span>
//           <br />
//           {createAgendaGrid(doctor.agendaConfig)}
//         </div>
//       ))}
//     </div>
//   );
// }

// export default Doctor;



import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

function Doctor({ specialty }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSpecialty, setCurrentSpecialty] = useState(specialty);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });

  const fetchDoctorsForSpecialty = useCallback(async (specialtyName) => {
    setCurrentSpecialty(specialtyName);
    setLoading(true);
    try {
      const response = await fetch(
        "https://apiuat.nabady.ma/api/users/medecin/search",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: specialtyName,
            consultation: "undefined",
            page: 1,
            result: 5,
            isIframe: false,
            referrer: "",
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      const data = await response.json();
      displayDoctors(data.praticien.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (specialty) {
      fetchDoctorsForSpecialty(specialty);
    }
  }, [specialty, fetchDoctorsForSpecialty]);

  useEffect(() => {
    if (emblaApi && doctors.length > 0) {
      emblaApi.reInit();
    }
  }, [doctors, emblaApi]);

  const displayDoctors = useCallback((doctorData) => {
    const filteredDoctors = doctorData.map((item) => {
      const doctor = item["0"];
      return {
        name: `Dr. ${doctor.lastname} ${doctor.firstname}`,
        tel: doctor.tel,
        email: doctor.email,
        address: doctor.adresse,
        agendaConfig: doctor.praticienCentreSoins[0].agendaConfig,
      };
    }).filter((doctor) => hasAvailableSlots(doctor.agendaConfig));
    setDoctors(filteredDoctors);
  }, []);

  const hasAvailableSlots = (agendaConfig) => {
    const now = new Date();
    const closingTime = new Date();
    closingTime.setHours(
      parseInt(agendaConfig.heureFermeture.split(":")[0], 10),
      parseInt(agendaConfig.heureFermeture.split(":")[1], 10),
      0
    );
    return now < closingTime;
  };

  const createAgendaGrid = (agendaConfig) => {
    const now = new Date();
    const { heureOuverture, heureFermeture } = agendaConfig;
    const openingHour = parseInt(heureOuverture.split(":")[0], 10);
    const closingHour = parseInt(heureFermeture.split(":")[0], 10);
    const slots = [];

    for (let hour = openingHour; hour < closingHour; hour++) {
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }

    const filteredSlots = slots.filter((slot) => {
      const slotTime = `${now.toDateString()} ${slot}`;
      return new Date(slotTime) > now;
    }).slice(0, 5);

    return (
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {filteredSlots.map((slot, index) => (
            <div className="embla__slide" key={index}>
              <button
                onClick={() => handleSlotClick(slot)}
                className="btn btn-primary my-2"
              >
                {slot}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleSlotClick = (slot) => {
    console.log("Slot selected:", slot);
  };

  return (
    <div className="rounded-lg p-4">
      {loading ? (
        <p className="text-blue-500">Searching for doctors in {currentSpecialty}...</p>
      ) : doctors.length > 0 ? (
        doctors.map((doctor, index) => (
          <div key={index} className="mb-2 p-2 border rounded-lg hover:bg-gray-100">
            <strong className="font-semibold">{doctor.name}</strong><br />
            <span className="text-sm text-gray-700">Tel: {doctor.tel}</span><br />
            <span className="text-sm text-gray-700">
              Email: <a href={`mailto:${doctor.email}`} className="text-blue-500 hover:text-blue-700 underline">{doctor.email}</a>
            </span><br />
            <span className="text-sm text-gray-700">Address: {doctor.address}</span><br />
            {createAgendaGrid(doctor.agendaConfig)}
          </div>
        ))
      ) : (
        <p>No doctors found for {currentSpecialty}.</p>
      )}
    </div>
  );
}

export default Doctor;

