import React, { useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const labels = {
  today: {
    darija: "Lyouma ",
    "الدارجة": " اليوم",
    "العربية": " اليوم",
    francais: "Aujourd'hui ",
    english: "Today ",
  },
  tomorrow: {
    darija: "Ghada ",
    "الدارجة": " الغد",
    "العربية": " الغد",
    francais: "Demain ",
    english: "Tomorrow ",
  },
};

function Doctor({ specialty, onSlotClick, selectedLanguage, isExtended }) {
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
            result: 15,
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
          unavailable_times: [],
        };
        const response = await fetch(
          `https://apipreprod.nabady.ma/api/holidays/praticienCs/${doctorDetails.PcsID}/day/0/limit/2`
        );
        const data = await response.json();
        doctorDetails.unavailable_times = data.rdv;
        return doctorDetails;
      })
    );

    setDoctors(
      filteredDoctors.filter((doctor) => hasAvailableSlots(doctor.agendaConfig))
    );
  };

  const hasAvailableSlots = (agendaConfig) => {
    if (!agendaConfig) {
      return false;
    }
  
    const now = new Date();
    const { heureOuverture, heureFermeture } = agendaConfig;
    const openingHour = parseInt(heureOuverture.split(":")[0], 10);
    const closingHour = parseInt(heureFermeture.split(":")[0], 10);
  
    let closingTime = new Date();
    closingTime.setHours(
      closingHour,
      parseInt(heureFermeture.split(":")[1], 10),
      0
    );
  
    if (now >= closingTime) {
      // If the current time is after the closing time, consider the next day's opening time
      const nextDay = new Date(now.getTime());
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(
        openingHour,
        parseInt(heureOuverture.split(":")[1], 10),
        0
      );
      closingTime = nextDay;
    }
  
    return now < closingTime;
  };
  

  const createAgendaGrid = (agendaConfig, doctor) => {
    const now = new Date();
    const { heureOuverture, heureFermeture, granularite } = agendaConfig;
    const openingHour = parseInt(heureOuverture.split(":")[0], 10);
    const closingHour = parseInt(heureFermeture.split(":")[0], 10);
    const [granularityHours, granularityMinutes] = granularite
      .split(":")
      .map(Number);

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
    const takenSlots = doctor.unavailable_times.map(
      (time) => time.currentStart.split(" ")[1].substring(0, 5)
    );
    filteredSlots = filteredSlots.filter((slot) => !takenSlots.includes(slot));

    if (filteredSlots.length < 2) {
      const nextDaySlots = [];
      let nextDaySlotTime = new Date(now.getTime());
      nextDaySlotTime.setDate(nextDaySlotTime.getDate() + 1);
      nextDaySlotTime.setHours(openingHour, 0, 0, 0);

      while (
        nextDaySlots.length < 2 - filteredSlots.length &&
        nextDaySlotTime.getHours() < closingHour
      ) {
        nextDaySlots.push(nextDaySlotTime.toTimeString().substring(0, 5));
        nextDaySlotTime.setHours(
          nextDaySlotTime.getHours() + granularityHours
        );
        nextDaySlotTime.setMinutes(
          nextDaySlotTime.getMinutes() + granularityMinutes
        );
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

    const isNextDay =
      slotTime.getHours() < openingHour || slotTime.getHours() >= closingHour;

    let selectedDate = new Date(now.getTime());
    if (isNextDay || isTomorrow) {
      selectedDate.setDate(selectedDate.getDate() + 1);
    }
    selectedDate.setHours(hours);
    selectedDate.setMinutes(minutes);
    selectedDate.setSeconds(0);
    selectedDate.setMilliseconds(0);

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
      setSlotIndex(slotIndex - 5);
    }
  };
  
  const showNextSlots = () => {
    if (slotIndex + 5 < slots.length) {
      setSlotIndex(slotIndex + 5);
    } else {
      setIsTomorrow(true);
      setSlots(
        createAgendaGridForTomorrow(currentDoctor.agendaConfig, currentDoctor)
      );
      setSlotIndex(0);
    }
  };

  const createAgendaGridForTomorrow = (agendaConfig, doctor) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const { heureOuverture, heureFermeture, granularite } = agendaConfig;
    const openingHour = parseInt(heureOuverture.split(":")[0], 10);
    const closingHour = parseInt(heureFermeture.split(":")[0], 10);
    const [granularityHours, granularityMinutes] = granularite
      .split(":")
      .map(Number);

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
    const takenSlots = doctor.unavailable_times.map(
      (time) => time.currentStart.split(" ")[1].substring(0, 5)
    );
    const filteredSlots = slots.filter((slot) => !takenSlots.includes(slot));

    return filteredSlots;
  };

  return (
    <div className="p-2">
      {loading && (
        <p className="text-primary">Loading {currentSpecialty}</p>
      )}
      {currentDoctor && (
        <div className="position-relative" style={{ width: "330px", margin: "0 auto" }}>
          <FaChevronLeft
            className="text-success cursor-pointer position-absolute"
            style={{ top: "50%", left: 0, transform: "translate(-50%, -50%)" }}
            onClick={showPreviousDoctor}
          />
          <div
            className="mb-2 p-3 border rounded shadow-sm mx-auto"
            style={{ width: "300px" }}
          >
            <div className="d-flex align-items-start mb-2">
              <img
                src="https://uat.nabady.ma/assets/images/avatars/medecin_homme.svg"
                alt="Doctor"
                className="mr-3"
                style={{ width: '48px', height: '48px' }}
              />
              <div className="flex-grow-1">
                <strong className="d-block mb-1" style={{ fontSize: '0.875rem', color: '#2A80B9' }}>
                  {currentDoctor.name}
                </strong>
                <div className="bg-light p-1 rounded">
                  <div className="d-flex align-items-start" style={{ fontSize: '0.75rem' }}>
                    <FaMapMarkerAlt className="mr-1 text-primary flex-shrink-0 mt-1" />
                    <span className="text-dark">
                      {currentDoctor.address}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center mb-2">
              <span className="text-muted" style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                {isTomorrow ? labels.tomorrow[selectedLanguage] : labels.today[selectedLanguage]}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <FaChevronLeft
                className="text-primary cursor-pointer"
                onClick={showPreviousSlots}
              />
              <div className="d-flex justify-content-center overflow-hidden">
                {slots.slice(slotIndex, slotIndex + 5).map((slot, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      handleSlotClick(
                        currentDoctor,
                        currentDoctor.name,
                        currentDoctor.PcsID,
                        slot
                      )
                    }
                    className="btn btn-info mx-1"
                    style={{ minWidth: "45px", padding: "0.25rem" }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              <FaChevronRight
                className="text-primary cursor-pointer"
                onClick={showNextSlots}
              />
            </div>
          </div>
          <FaChevronRight
            className="text-success cursor-pointer position-absolute"
            style={{ top: "50%", right: 0, transform: "translate(50%, -50%)" }}
            onClick={showNextDoctor}
          />
        </div>
      )}
    </div>
  );
  
}

export default Doctor;