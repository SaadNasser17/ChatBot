// Doctor.jsx

import React, { useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";

function Doctor({ specialty, onSlotClick }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSpecialty, setCurrentSpecialty] = useState("");
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  useEffect(() => {
    if (specialty) {
      fetchDoctorsForSpecialty(specialty);
    }
  }, [specialty]);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [doctors, emblaApi]);

  const fetchDoctorsForSpecialty = async (specialtyName) => {
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
          PcsID: doctor.praticienCentreSoins[0].id, // Extracting PcsID
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

  const createAgendaGrid = (agendaConfig, doctor) => {
    const now = new Date();
    const { heureOuverture, heureFermeture, granularite } = agendaConfig;
    const openingHour = parseInt(heureOuverture.split(":")[0], 10);
    const closingHour = parseInt(heureFermeture.split(":")[0], 10);
    const [granularityHours, granularityMinutes] = granularite.split(":").map(Number);

    const slots = [];
    let slotTime = new Date();
    slotTime.setHours(openingHour, 0, 0, 0);

    const endTime = new Date();
    endTime.setHours(closingHour, 0, 0, 0);

    if (now >= endTime) {
        slotTime.setDate(now.getDate() + 1); // Move to the next day
        slotTime.setHours(openingHour, 0, 0, 0);
    }

    while (slotTime < endTime || slotTime.getDate() !== now.getDate()) {
        slots.push(slotTime.toTimeString().substring(0, 5));
        slotTime.setHours(slotTime.getHours() + granularityHours);
        slotTime.setMinutes(slotTime.getMinutes() + granularityMinutes);
        if (slotTime.getHours() >= closingHour) {
            break;
        }
    }

    let filteredSlots = slots.filter((slot) => {
        const slotDate = new Date(now.toDateString() + " " + slot);
        return slotDate >= now;
    });

    if (filteredSlots.length < 2) {
        const nextDaySlots = [];
        let nextDaySlotTime = new Date(now.getTime());
        nextDaySlotTime.setDate(nextDaySlotTime.getDate() + 1);
        nextDaySlotTime.setHours(openingHour, 0, 0, 0);

        while (nextDaySlots.length < (2 - filteredSlots.length) && nextDaySlotTime.getHours() < closingHour) {
            nextDaySlots.push(nextDaySlotTime.toTimeString().substring(0, 5));
            nextDaySlotTime.setHours(nextDaySlotTime.getHours() + granularityHours);
            nextDaySlotTime.setMinutes(nextDaySlotTime.getMinutes() + granularityMinutes);
        }

        filteredSlots = filteredSlots.concat(nextDaySlots);
    }

    return (
      <div className="embla" ref={emblaRef}>
        <span className="text-lg bold">Sway3 li mojodin:</span>
        <div className="embla__container">
          {filteredSlots.map((slot, index) => (
            <div className="embla__slide" key={index}>
              <button
                onClick={() => onSlotClick(doctor.name, doctor.PcsID, slot)}
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

  return (
    <div className="rounded-lg p-4">
      {loading && (
        <p className="text-blue-500">hana kn9alab f {currentSpecialty}</p>
      )}
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
            Email:
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
          {createAgendaGrid(doctor.agendaConfig, doctor)}
        </div>
      ))}
    </div>
  );
}

export default Doctor;
