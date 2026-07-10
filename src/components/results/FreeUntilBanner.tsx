"use client";

import { useEffect, useState } from "react";
import { Gift } from "lucide-react";

// LWYRD is free during the launch window. Update this single date to change or
// extend the offer (or remove the banner usage once paid access returns).
export const FREE_UNTIL = new Date("2026-07-31T23:59:59");

function getUnits(ms: number): { value: string; label: string }[] {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return [
    { value: String(days), label: "days" },
    { value: pad(hours), label: "hrs" },
    { value: pad(minutes), label: "min" },
    { value: pad(seconds), label: "sec" },
  ];
}

const freeUntilLabel = FREE_UNTIL.toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export default function FreeUntilBanner() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(FREE_UNTIL.getTime() - Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Don't render anything once the free window has closed.
  if (remaining !== null && remaining <= 0) return null;

  return (
    <div className="results-free-note">
      <span className="results-free-icon">
        <Gift size={16} strokeWidth={1.8} />
      </span>
      <p>LWYRD is free until {freeUntilLabel}.</p>
      {remaining !== null && (
        <div className="results-free-countdown" role="timer" aria-live="off">
          {getUnits(remaining).map((unit) => (
            <span key={unit.label} className="results-free-unit">
              <span className="results-free-unit-value">{unit.value}</span>
              <span className="results-free-unit-label">{unit.label}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
