import React, { createContext, useContext, useState, useEffect } from 'react';

interface MotionContextType {
  reduceMotion: boolean;
  setReduceMotion: (val: boolean) => void;
  toggleReduceMotion: () => void;
}

const MotionContext = createContext<MotionContextType | undefined>(undefined);

export const MotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reduceMotion, setReduceMotionState] = useState<boolean>(() => {
    const saved = localStorage.getItem('foodsense_reduce_motion');
    if (saved !== null) return saved === 'true';
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('foodsense_reduce_motion', String(reduceMotion));
  }, [reduceMotion]);

  const setReduceMotion = (val: boolean) => {
    setReduceMotionState(val);
  };

  const toggleReduceMotion = () => {
    setReduceMotionState((prev) => !prev);
  };

  return (
    <MotionContext.Provider value={{ reduceMotion, setReduceMotion, toggleReduceMotion }}>
      {children}
    </MotionContext.Provider>
  );
};

export const useMotion = () => {
  const context = useContext(MotionContext);
  if (!context) {
    throw new Error('useMotion must be used within a MotionProvider');
  }
  return context;
};
