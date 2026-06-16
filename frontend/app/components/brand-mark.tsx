"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { useState } from "react";

export function BrandMark() {
  const pathname = usePathname();
  const router = useRouter();
  const [blinkId, setBlinkId] = useState(0);

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setBlinkId((id) => id + 1);

    if (pathname !== "/") {
      window.setTimeout(() => router.push("/"), 180);
    }
  }

  return (
    <Link
      href="/"
      aria-label="Retra home"
      className="brand-mark"
      onClick={onClick}
    >
      <svg
        key={blinkId}
        aria-hidden="true"
        className={
          blinkId > 0 ? "brand-mark-eye eye-mark-click-blink" : "brand-mark-eye"
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
      <span className="brand-mark-text">Retra</span>
    </Link>
  );
}
