import React, { useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { labels } from "../utils/doctor";

labels;

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
        const response = await fetch("http://localhost:5000/get_doctors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ specialty_name: specialtyName }),
        });
        if (!response.ok) throw new Error("Network response was not ok.");
        const data = await response.json();
        displayDoctors(data);
    } catch (error) {
        console.error("Error fetching doctors:", error);
    } finally {
        setLoading(false);
    }
};

const displayDoctors = async (doctorData) => {
    console.log("doctorData received from API:", doctorData); // Log full doctor data from the API

    const filteredDoctors = await Promise.all(
        doctorData.map(async (item, index) => {
            // Check if "0" key is present
            if (!item["0"]) {
                console.error(`Missing "0" key in item at index ${index}`, item); // Error log if '0' is missing
                return null;
            }

            const doctor = item["0"].praticien;  // Access 'praticien' inside '0'
            if (!doctor) {
                console.error(`Missing 'praticien' key in item at index ${index}`, item["0"]); // Error log if 'praticien' is missing
                return null;
            }

            // Log the full doctor object including praticienCentreSoins
            //console.log("Full doctor object: ", item["0"]);

            // Extract the PcsID from praticienCentreSoins URL
            const pcsIdUrl = item["0"].praticien?.praticienCentreSoins?.[0];
            const PcsID = pcsIdUrl ? pcsIdUrl.split("/").pop() : 'No PcsID';
            console.log(`Doctor details for ${doctor.lastname || 'Unknown'} with PcsID: ${PcsID}`); // Log extracted PcsID

            const doctorDetails = {
                name: `Dr. ${doctor.lastname || 'Unknown'} ${doctor.firstname || 'Unknown'}`,
                PcsID,  // Use the extracted PcsID
                tel: doctor.tel || 'N/A',
                email: doctor.email || 'N/A',
                address: doctor.adresse || 'N/A',
                agendaConfig: item["0"].agendaConfig || {},
                unavailable_times: [],
            };

            //console.log(`Doctor details for ${doctor.lastname || 'Unknown'}:`, doctorDetails);  // Log doctor details

            // Fetch unavailable times for the doctor
            const response = await fetch(
                `https://apipreprod.nabady.ma/api/holidays/praticienCs/${doctorDetails.PcsID}/day/0/limit/2`
            );
            const data = await response.json();
            doctorDetails.unavailable_times = data.rdv || [];
            return doctorDetails;
        })
    );

    // Filter and set the doctors who have available slots
    const validDoctors = filteredDoctors.filter(Boolean);  // Filter out null values
    setDoctors(validDoctors.filter((doctor) => hasAvailableSlots(doctor.agendaConfig)));
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
    // Parse the hours and minutes from the selected slot
    const [hours, minutes] = slot.split(":").map(Number);
  
    // Set the date for the selected slot time
    const now = new Date();
    let selectedDate = new Date(now);
  
    // Set the hours and minutes for the selected time in local time
    selectedDate.setHours(hours);
    selectedDate.setMinutes(minutes);
    selectedDate.setSeconds(0);
    selectedDate.setMilliseconds(0);
  
    // Check if the selected time is for tomorrow (based on the button click)
    if (isTomorrow) {
      selectedDate.setDate(selectedDate.getDate() + 1);
    }
  
    // Instead of using `toISOString()` which converts to UTC, format manually
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const hour = String(selectedDate.getHours()).padStart(2, '0');
    const minute = String(selectedDate.getMinutes()).padStart(2, '0');
    
    // Create the ISO-like string manually without converting to UTC
    const formattedDate = `${year}-${month}-${day}T${hour}:${minute}:00.000Z`;
  
    console.log(`Debug: Selected Doctor - ${doctorName}, PcsID - ${PcsID}, Slot - ${formattedDate}`); // Debug statement to log selected details
  
    // Call the provided callback with the selected doctor details and time slot
    onSlotClick(doctorName, PcsID, formattedDate);
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
                src="https://preprod.nabady.ma/assets/images/avatars/medecin_homme.svg"
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
                    className="btn  mx-1"
                    style={{ minWidth: "43px", padding: "0.3rem",backgroundColor:'#00a99d' }}
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