import React, { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number; // percentage
  y: number; // percentage
  size: number;
  color: string;
  delay: number;
  duration: number;
  angle: number;
}

export default function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const colors = [
    "#FFC107", // Amber
    "#FF5722", // Orange Red
    "#E91E63", // Pink
    "#9C27B0", // Purple
    "#3F51B5", // Indigo
    "#00BCD4", // Cyan
    "#4CAF50", // Green
    "#8BC34A", // Lime Green
    "#00E676", // Neon Green
    "#FF3D00"  // Deep Orange
  ];

  useEffect(() => {
    const arr: Particle[] = [];
    for (let i = 0; i < 90; i++) {
      arr.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 25,
        size: 6 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 1.5,
        duration: 2.5 + Math.random() * 2.5,
        angle: Math.random() * 360,
      });
    }
    setParticles(arr);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size * (0.6 + Math.random() * 0.8)}px`, // rectangle / square shapes
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px", // mix of circles and squares
            transform: `rotate(${p.angle}deg)`,
            animationName: "fall",
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationIterationCount: 1,
            animationFillMode: "forwards",
            animationTimingFunction: "cubic-bezier(0.1, 0.8, 0.3, 1)",
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg) translateX(0);
            opacity: 1;
          }
          50% {
            translateX: 20px;
          }
          100% {
            transform: translateY(115vh) rotate(1080deg) translateX(-20px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
