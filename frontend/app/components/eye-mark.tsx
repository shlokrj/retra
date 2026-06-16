"use client";

import { useState } from "react";

export function EyeMark() {
  const [blinkId, setBlinkId] = useState(0);

  return (
    <button
      type="button"
      className="eye-mark"
      aria-label="Blink Retra eye"
      onClick={() => setBlinkId((id) => id + 1)}
    >
      <svg
        key={blinkId}
        aria-hidden="true"
        className={
          blinkId > 0 ? "eye-mark-svg eye-mark-click-blink" : "eye-mark-svg"
        }
        viewBox="0 0 64 40"
      >
        <g className="eye-mark-eye-group">
          <path
            className="eye-mark-outline"
            d="M4 20C11.5 9.5 21.5 5 32 5s20.5 4.5 28 15c-7.5 10.5-17.5 15-28 15S11.5 30.5 4 20Z"
          />
          <circle className="eye-mark-pupil" cx="32" cy="20" r="5.5" />
        </g>
      </svg>
    </button>
  );
}
