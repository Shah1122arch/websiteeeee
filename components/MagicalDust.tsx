"use client";

import { useEffect, useState } from "react";

export function MagicalDust() {
  const [particles, setParticles] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setParticles(Array.from({ length: 25 }, (_, i) => i));
  }, []);

  if (!mounted) return null;

  return (
    <div className="particles-container">
      {particles.map((i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${7 + Math.random() * 10}s`,
            width: `${1 + Math.random() * 3}px`,
            height: `${1 + Math.random() * 3}px`,
            opacity: 0.1 + Math.random() * 0.4,
          }}
        />
      ))}
    </div>
  );
}
