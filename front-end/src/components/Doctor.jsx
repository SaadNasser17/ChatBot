import React, { useState, useEffect } from "react";

function Doctor({ specialty }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (specialty) {
      fetchDoctorsForSpecialty(specialty);
    }
  }, [specialty]);

  const fetchDoctorsForSpecialty = async (specialtyName) => {
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
      if (!response.ok) throw new Error("Network response was not ok.");
      const data = await response.json();
      displayDoctors(data.praticien.data);
    } catch (error) {
      console.log("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayDoctors = (doctorData) => {
    const filteredDoctors = doctorData
      .map((item) => {
        const doctor = item["0"];
        return {
          name: `Dr. ${doctor.lastname} ${doctor.firstname}`,
          tel: doctor.tel,
          email: doctor.email,
          address: doctor.adresse,
          agendaConfig: doctor.praticienCentreSoins[0].agendaConfig,
        };
      })
      .filter((doctor) => hasAvailableSlots(doctor.agendaConfig));
    setDoctors(filteredDoctors);
  };

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
    const currentTime = now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0');
    const { heureOuverture, heureFermeture } = agendaConfig;
    const openingHour = parseInt(heureOuverture.split(":")[0], 10);
    const closingHour = parseInt(heureFermeture.split(":")[0], 10);
    const slots = [];
    for (let hour = openingHour; hour < closingHour; hour++) {
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }
    const filteredSlots = slots.filter(slot => slot >= currentTime).slice(0, 5);
  
    return (
   <>
      <div>
        <span className="text-lg boold">Sway3 li mojodin:</span>
        <ul className="list-disc pl-5">
          {filteredSlots.map((slot, index) => (
            <button key={index} onClick={() => handleSlotClick(slot)} className="time-slot-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              {slot}
            </button>
          ))}
        </ul>
      </div>
      
      </>
    );
  };
  

  const handleSlotClick = (slot) => {
    console.log('Slot selected:', slot);
    // Here you can add the functionality for when a slot is clicked
  };

  return (
    <div className="rounded-lg p-4">
      {loading && <p className="text-blue-500">hana kn9alab...</p>}
      {doctors.map((doctor, index) => (
        <div
          key={index}
          className="mb-2 p-2 border rounded-lg hover:bg-gray-100"
        >
          <strong className="font-semibold">{doctor.name}</strong>
          <br />
          <span className="text-sm text-gray-700">Tel: {doctor.tel}</span>
          <br />
          <span className="text-sm text-gray-700">
            Email:{" "}
            <a
              href={`mailto:${doctor.email}`}
              className="text-blue-500 hover:text-blue-700 underline"
            >
              {doctor.email}
            </a>
          </span>
          <br />
          <span className="text-sm text-gray-700">
            Address: {doctor.address}
          </span>
          <br />
          {createAgendaGrid(doctor.agendaConfig)}
        </div>
      ))}
    </div>
  );
}

export default Doctor;
