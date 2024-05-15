import React, { useState } from 'react';

function Pagination() {
  const [index, setIndex] = useState(0);
  const content = ['Page 1', 'Page 2', 'Page 3', 'Page 4', 'Page 5'];

  const handlePrev = () => {
    setIndex(prev => (prev > 0 ? prev - 1 : 0));
  };

  const handleNext = () => {
    setIndex(prev => (prev < content.length - 1 ? prev + 1 : prev));
  };

  return (
    <div className="flex items-center justify-center space-x-4 mt-10">
      <button onClick={handlePrev} className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded">
        &lt;
      </button>
      <div className="text-lg font-semibold">
        {content[index]}
      </div>
      <button onClick={handleNext} className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded">
        &gt;
      </button>
    </div>
  );
}

export default Pagination;
