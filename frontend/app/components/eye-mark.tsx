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
      <span
        key={blinkId}
        aria-hidden="true"
        className={blinkId > 0 ? "eye-mark-eye eye-mark-click-blink" : "eye-mark-eye"}
      />
    </button>
  );
}
