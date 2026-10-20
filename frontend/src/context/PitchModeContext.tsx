import React, { createContext, useContext, useState, useEffect } from 'react';

interface PitchModeContextType {
  isPitchMode: boolean;
  togglePitchMode: () => void;
  setPitchMode: (val: boolean) => void;
}

const PitchModeContext = createContext<PitchModeContextType | undefined>(undefined);

export const PitchModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPitchMode, setIsPitchModeState] = useState<boolean>(() => {
    return localStorage.getItem('foodsense_pitch_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('foodsense_pitch_mode', String(isPitchMode));
    if (isPitchMode) {
      document.documentElement.classList.add('pitch-mode');
    } else {
      document.documentElement.classList.remove('pitch-mode');
    }
  }, [isPitchMode]);

  const togglePitchMode = () => {
    setIsPitchModeState((prev) => !prev);
  };

  const setPitchMode = (val: boolean) => {
    setIsPitchModeState(val);
  };

  return (
    <PitchModeContext.Provider value={{ isPitchMode, togglePitchMode, setPitchMode }}>
      {children}
    </PitchModeContext.Provider>
  );
};

export const usePitchMode = () => {
  const context = useContext(PitchModeContext);
  if (!context) {
    throw new Error('usePitchMode must be used within a PitchModeProvider');
  }
  return context;
};
