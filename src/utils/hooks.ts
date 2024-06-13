'use client'
import {useState, useEffect} from 'react'

export const useWindowSize = (width: number): Boolean => {
    const [isWide, setIsWide] = useState(true);
  
  useEffect(() => {
    if (window) {
      const handleResize = () => {
        setIsWide(window.innerWidth >= width);
      };
  
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [width]);

  return isWide;
};