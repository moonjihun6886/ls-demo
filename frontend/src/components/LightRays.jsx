import React from "react";

export default function LightRays({ className = "", center = "55% 45%" }) {
  // Pure CSS, subtle light-rays overlay for dark hero. Non-interactive.
  return (
    <div className={`light-rays ${className}`} aria-hidden>
      <div className="rays-layer rays-1" style={{ transformOrigin: center }} />
      <div className="rays-layer rays-2" style={{ transformOrigin: center }} />
      <div className="rays-glow" />
    </div>
  );
}