import React from "react";

export default function Dice3D({ size = 700, cube = 240 }) {
  const half = cube / 2;
  return (
    <div className="dice-viewport hidden md:block" style={{ width: size, height: size }}>
      <div className="dice-wrapper">
        <div className="dice-cube" style={{ width: cube, height: cube }}>
          {/* Face 1 */}
          <div className="dice-face face-1" style={{ transform: `rotateY(0deg) translateZ(${half}px)` }}>
            <div className="pip center" />
          </div>
          {/* Face 2 */}
          <div className="dice-face face-2" style={{ transform: `rotateY(90deg) translateZ(${half}px)` }}>
            <div className="pip tl" />
            <div className="pip br" />
          </div>
          {/* Face 3 */}
          <div className="dice-face face-3" style={{ transform: `rotateY(180deg) translateZ(${half}px)` }}>
            <div className="pip tl" />
            <div className="pip center" />
            <div className="pip br" />
          </div>
          {/* Face 4 */}
          <div className="dice-face face-4" style={{ transform: `rotateY(-90deg) translateZ(${half}px)` }}>
            <div className="pip tl" />
            <div className="pip tr" />
            <div className="pip bl" />
            <div className="pip br" />
          </div>
          {/* Face 5 */}
          <div className="dice-face face-5" style={{ transform: `rotateX(90deg) translateZ(${half}px)` }}>
            <div className="pip tl" />
            <div className="pip tr" />
            <div className="pip center" />
            <div className="pip bl" />
            <div className="pip br" />
          </div>
          {/* Face 6 */}
          <div className="dice-face face-6" style={{ transform: `rotateX(-90deg) translateZ(${half}px)` }}>
            <div className="pip ml" />
            <div className="pip ml mid" />
            <div className="pip ml bottom" />
            <div className="pip mr" />
            <div className="pip mr mid" />
            <div className="pip mr bottom" />
          </div>
        </div>
      </div>
    </div>
  );
}