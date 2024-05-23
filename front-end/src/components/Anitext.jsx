import React, { useEffect, useRef } from "react";
import Typed from "typed.js";

function AniText({ msg }) {
  const el = useRef(null);

  useEffect(() => {
    const options = {
      strings: [msg],
      typeSpeed: 40,
      showCursor: false,
    };
    const typed = new Typed(el.current, options);

    return () => {
      typed.destroy();
    };
  }, [msg]);

  return <span ref={el}></span>;
}

export default AniText;
