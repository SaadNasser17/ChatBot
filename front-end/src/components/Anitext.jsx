import React, { useEffect, useRef } from "react";
import Typed from "typed.js";

function AniText({ msg, forceStopTyping }) {
  const el = useRef(null);
  const typed = useRef(null);

  useEffect(() => {
    const options = {
      strings: [msg],
      typeSpeed: 40,
      showCursor: false,
    };
    typed.current = new Typed(el.current, options);

    return () => {
      if (typed.current) {
        typed.current.destroy();
      }
    };
  }, [msg]);

  useEffect(() => {
    if (forceStopTyping && typed.current) {
      typed.current.stop();
    }
  }, [forceStopTyping]);

  return <span ref={el}></span>;
}

export default AniText;
