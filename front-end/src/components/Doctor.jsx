import React, { useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

function Doctor({ specialty, onSlotClick }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSpecialty, setCurrentSpecialty] = useState("");
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slots, setSlots] = useState([]);
  const [isTomorrow, setIsTomorrow] = useState(false);

  const currentDoctor = doctors[currentDoctorIndex];

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

  useEffect(() => {
    if (currentDoctor) {
      setSlots(createAgendaGrid(currentDoctor.agendaConfig, currentDoctor));
    }
  }, [currentDoctor]);

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
        const response = await fetch(`https://apipreprod.nabady.ma/api/holidays/praticienCs/${doctorDetails.PcsID}/day/0/limit/2`);
        const data = await response.json();
        doctorDetails.unavailable_times = data.rdv;
        return doctorDetails;
      })
    );

    setDoctors(filteredDoctors.filter((doctor) => hasAvailableSlots(doctor.agendaConfig)));
  };

  const hasAvailableSlots = (agendaConfig) => {
    const now = new Date();
    const { heureOuverture, heureFermeture } = agendaConfig;
    const openingHour = parseInt(heureOuverture.split(":")[0], 10);
    const closingHour = parseInt(heureFermeture.split(":")[0], 10);

    let closingTime = new Date();
    closingTime.setHours(closingHour, parseInt(heureFermeture.split(":")[1], 10), 0);

    if (now >= closingTime) {
      // If the current time is after the closing time, consider the next day's opening time
      const nextDay = new Date(now.getTime());
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(openingHour, parseInt(heureOuverture.split(":")[1], 10), 0);
      closingTime = nextDay;
    }

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

  const handleSlotClick = async (doctor, doctorName, PcsID, slot) => {
    const [hours, minutes] = slot.split(":");

    const { heureOuverture, heureFermeture } = doctor.agendaConfig;
    const openingHour = parseInt(heureOuverture.split(":")[0], 10);
    const closingHour = parseInt(heureFermeture.split(":")[0], 10);

    const now = new Date();
    const slotTime = new Date(now.getTime());
    slotTime.setHours(hours);
    slotTime.setMinutes(minutes);
    slotTime.setSeconds(0);
    slotTime.setMilliseconds(0);

    const isNextDay = slotTime.getHours() < openingHour || slotTime.getHours() >= closingHour;

    let selectedDate;
    if (isNextDay) {
      selectedDate = new Date(now.getTime());
      selectedDate.setDate(selectedDate.getDate() + 1);
      selectedDate.setHours(hours);
      selectedDate.setMinutes(minutes);
      selectedDate.setSeconds(0);
      selectedDate.setMilliseconds(0);
    } else {
      selectedDate = new Date(now.getTime());
      selectedDate.setHours(hours);
      selectedDate.setMinutes(minutes);
      selectedDate.setSeconds(0);
      selectedDate.setMilliseconds(0);
    }

    const isoString = selectedDate.toISOString();

    onSlotClick(doctorName, PcsID, isoString);
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const showPreviousDoctor = () => {
    if (currentDoctorIndex > 0) {
      setCurrentDoctorIndex(currentDoctorIndex - 1);
      setSlotIndex(0);
      setIsTomorrow(false);
    }
  };

  const showNextDoctor = () => {
    if (currentDoctorIndex < doctors.length - 1) {
      setCurrentDoctorIndex(currentDoctorIndex + 1);
      setSlotIndex(0);
      setIsTomorrow(false);
    }
  };

  const showPreviousSlots = () => {
    if (slotIndex > 0) {
      setSlotIndex(slotIndex - 4);
    }
  };

  const showNextSlots = () => {
    if (slotIndex + 4 < slots.length) {
      setSlotIndex(slotIndex + 4);
    } else {
      setIsTomorrow(true);
      setSlots(createAgendaGridForTomorrow(currentDoctor.agendaConfig, currentDoctor));
      setSlotIndex(0);
    }
  };

  const createAgendaGridForTomorrow = (agendaConfig, doctor) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const { heureOuverture, heureFermeture, granularite } = agendaConfig;
    const openingHour = parseInt(heureOuverture.split(":")[0], 10);
    const closingHour = parseInt(heureFermeture.split(":")[0], 10);
    const [granularityHours, granularityMinutes] = granularite.split(":").map(Number);

    const slots = [];
    let slotTime = new Date(tomorrow);
    slotTime.setHours(openingHour, 0, 0, 0);

    const endTime = new Date(tomorrow);
    endTime.setHours(closingHour, 0, 0, 0);

    while (slotTime < endTime) {
      slots.push(slotTime.toTimeString().substring(0, 5));
      slotTime.setHours(slotTime.getHours() + granularityHours);
      slotTime.setMinutes(slotTime.getMinutes() + granularityMinutes);
    }

    // Filter out taken slots
    const takenSlots = doctor.unavailable_times.map(time => time.currentStart.split(" ")[1].substring(0, 5));
    const filteredSlots = slots.filter(slot => !takenSlots.includes(slot));

    return filteredSlots;
  };

  return (
    <div className="p-2">
      {loading && (
        <p className="text-picton-blue-500">Loading {currentSpecialty}</p>
      )}
      {currentDoctor && (
        <div className="mb-2 p-2 border rounded-md hover:bg-jordy-blue-50 shadow-sm">
          <div className="flex justify-between items-center">
            <FaChevronLeft
              className="text-picton-blue-500 text-lg cursor-pointer"
              onClick={showPreviousDoctor}
            />
            <div className="text-center">
              <img
                src="https://uat.nabady.ma/assets/images/avatars/medecin_homme.svg"
                alt="Doctor"
                className="w-12 h-12 mx-auto mb-2"
              />
              <strong className="font-semibold text-base text-jordy-blue-800 mb-1 block">
                {currentDoctor.name}
              </strong>
              <div className="mb-1 flex items-center justify-center">
                <FaMapMarkerAlt className="mr-2 text-picton-blue-500 text-sm" />
                <span className="text-gray-700 text-sm">{currentDoctor.address}</span>
              </div>
            </div>
            <FaChevronRight
              className="text-picton-blue-500 text-lg cursor-pointer"
              onClick={showNextDoctor}
            />
          </div>
          <div className="embla">
            <span className="text-lg bold">
              Mawa3id li kaynin {isTomorrow ? "ghada" : "lyoum"}:
            </span>
            <div className="flex justify-between items-center mt-2">
              <FaChevronLeft
                className="text-picton-blue-500 text-lg cursor-pointer"
                onClick={showPreviousSlots}
              />
              <div className="embla__container flex justify-center overflow-hidden">
                {slots.slice(slotIndex, slotIndex + 4).map((slot, index) => (
                  <div className="embla__slide flex-none mx-1" key={index}>
                    <button
                      onClick={() => handleSlotClick(currentDoctor, currentDoctor.name, currentDoctor.PcsID, slot)}
                      className="bg-picton-blue-300 rounded-lg text-sm my-1 mx-1"
                      style={{ minWidth: "50px", padding: "0.25rem 0.5rem" }}
                    >
                      {slot}
                    </button>
                  </div>
                ))}
              </div>
              <FaChevronRight
                className="text-picton-blue-500 text-lg cursor-pointer"
                onClick={showNextSlots}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Doctor;
