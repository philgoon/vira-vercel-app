// [R-STM] STM Morse Code Animation for login brand panel
// Cycles through S (dot dot dot), T (dash), M (dash dash) with letter reveals
'use client';

import { useState, useEffect } from 'react';

const morseLetters = [
  { letter: 'S', pattern: ['dot', 'dot', 'dot'] },
  { letter: 'T', pattern: ['dash'] },
  { letter: 'M', pattern: ['dash', 'dash'] },
];

export function MorseAnimation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    if (showLogo) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= morseLetters.length - 1) {
          clearInterval(timer);
          setTimeout(() => setShowLogo(true), 600);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [showLogo]);

  if (showLogo) {
    return (
      <div className="stm-login-logo-reveal">
        <div className="stm-tool-wordmark stm-tool-wordmark-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/icons/stm-morse-code-white.svg"
            alt="STM"
            className="stm-tool-wordmark-icon"
          />
          <span className="stm-tool-wordmark-name">VIRA</span>
        </div>
      </div>
    );
  }

  const current = morseLetters[currentIndex];

  return (
    <div className="stm-login-morse-container">
      <div className="stm-login-morse-signal" key={currentIndex}>
        <div className="stm-login-morse-symbols">
          {current.pattern.map((type, i) => (
            <span
              key={i}
              className={type === 'dot' ? 'stm-login-morse-dot' : 'stm-login-morse-dash'}
            />
          ))}
        </div>
        <span className="stm-login-morse-letter">{current.letter}</span>
      </div>
    </div>
  );
}
