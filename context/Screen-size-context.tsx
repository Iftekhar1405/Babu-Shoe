'use client';

import React, { createContext, useContext, useEffect, useState } from "react";

type ScreenSizeContextType = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
};

const ScreenSizeContext = createContext<ScreenSizeContextType | undefined>(undefined);

export const ScreenSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [screenSize, setScreenSize] = useState<ScreenSizeContextType>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024,
      });
    }

    // run once at start
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <ScreenSizeContext.Provider value={screenSize}>
      {children}
    </ScreenSizeContext.Provider>
  );
};

// Hook to consume context
export function useScreenSize() {
  const context = useContext(ScreenSizeContext);
  if (context === undefined) {
    throw new Error("useScreenSize must be used within a ScreenSizeProvider");
  }
  return context;
}
