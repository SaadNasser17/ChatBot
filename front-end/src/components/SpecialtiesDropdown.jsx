import React, { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

function SpecialtiesDropdown({ specialties, fetchDoctorsForSpecialty }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    containScroll: "keepSnaps",
    draggable: true,
    slidesToScroll: 1,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    const updateScrollButtons = () => {
      if (emblaApi) {
        setCanScrollPrev(emblaApi.canScrollPrev());
        setCanScrollNext(emblaApi.canScrollNext());
      }
    };

    if (emblaApi) {
      emblaApi.on("select", updateScrollButtons);
      emblaApi.on("init", updateScrollButtons);
      updateScrollButtons(); 
      emblaApi.reInit(); 
    }
    return () => emblaApi && emblaApi.off("select", updateScrollButtons);
  }, [emblaApi, specialties]);

  return (
    <div className="p-3 bg-black-squeeze rounded-b-xl overflow-hidden shadow-lg">
      <div className="flex items-center justify-center">
        <button
          onClick={() => emblaApi.scrollPrev()}
          className={`bg-picton-blue-500 hover:bg-persian-green-600 text-white p-1 rounded mt-2 text-sm ${
            !canScrollPrev ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!canScrollPrev}
        >
          &lt;
        </button>
        <div className="embla overflow-hidden" ref={emblaRef}>
          <div className="embla__container flex">
            {specialties.map((specialty) => (
              <div className="embla__slide" key={specialty.id}>
                <button
                  onClick={() => fetchDoctorsForSpecialty(specialty.name)}
                  className="bg-picton-blue-500 opacity-40 text-white p-2 m-1 rounded-lg hover:bg-persian-green-500 text-sm"
                >
                  {specialty.name}
                </button>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => emblaApi.scrollNext()}
          className={`bg-picton-blue-500 hover:bg-persian-green-600 text-white p-1 rounded mt-2 text-sm ${
            !canScrollNext ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!canScrollNext}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

export default SpecialtiesDropdown;

