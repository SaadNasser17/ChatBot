// Doctor.jsx
import React, { useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { FaMapMarkerAlt } from 'react-icons/fa';

function Doctor({ specialty, onSlotClick, fetchMotifs }) {
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
        "https://apipreprod.nabady.ma/api/users/medecin/search",
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

  const displayDoctors = async (doctorData) => {
    const filteredDoctors = await Promise.all(
      doctorData.map(async (item) => {
        const doctor = item["0"];
        const doctorDetails = {
          name: `Dr. ${doctor.lastname} ${doctor.firstname}`,
          PcsID: doctor.praticienCentreSoins[0].id,
          tel: doctor.tel,
          email: doctor.email,
          address: doctor.adresse,
          agendaConfig: doctor.praticienCentreSoins[0].agendaConfig,
          unavailable_times: []
        };
        const response = await fetch(`https://apipreprod.nabady.ma/api/holidays/praticienCs/${doctorDetails.PcsID}/day/0/limit/1`);
        const data = await response.json();
        doctorDetails.unavailable_times = data.rdv;
        return doctorDetails;
      })
    );

    setDoctors(filteredDoctors.filter((doctor) => hasAvailableSlots(doctor.agendaConfig)));
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
        slotTime.setDate(now.getDate() + 1);
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

    // Filter out taken slots
    const takenSlots = doctor.unavailable_times.map(time => time.currentStart.split(" ")[1].substring(0, 5));
    filteredSlots = filteredSlots.filter(slot => !takenSlots.includes(slot));

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

    return filteredSlots;
  };

  const handleSlotClick = async (doctorName, PcsID, slot) => {
    const selectedDate = new Date(); // Replace with the actual date the slot is for
    const [hours, minutes] = slot.split(":");
    selectedDate.setHours(hours);
    selectedDate.setMinutes(minutes);
    selectedDate.setSeconds(0);
    selectedDate.setMilliseconds(0);

    const isoString = selectedDate.toISOString();

    onSlotClick(doctorName, PcsID, isoString);
    await delay(6000); // Adjust this delay as needed
    fetchMotifs(PcsID);
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  return (
    <div className="p-2">
      {loading && (
        <p className="text-picton-blue-500">Loading {currentSpecialty}</p>
      )}
      {doctors.map((doctor, index) => (
        <div
          key={index}
          className="mb-2 p-2 border rounded-md hover:bg-jordy-blue-50 shadow-sm"
        >
          <strong className="font-semibold text-base text-jordy-blue-800 mb-1 block">{doctor.name}</strong>
          <div className="mb-1 flex items-center">
            <FaMapMarkerAlt className="mr-2 text-picton-blue-500 text-sm" />
            <span className="text-gray-700 text-sm">{doctor.address}</span>
          </div>
          <div className="embla" ref={emblaRef}>
            <span className="text-lg bold">Available Slots:</span>
            <div className="embla__container flex overflow-x-auto">
              {createAgendaGrid(doctor.agendaConfig, doctor).map((slot, index) => (
                <div className="embla__slide flex-none" key={index}>
                  <button
                    onClick={() => handleSlotClick(doctor.name, doctor.PcsID, slot)}
                    className=" bg-picton-blue-300 rounded-lg text-sm my-1 mx-1"
                    style={{ minWidth: "50px", padding: "0.25rem 0.5rem" }}
                  >
                    {slot}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Doctor;
