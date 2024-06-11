import {useState, useEffect} from 'react'

export const useWindowSize = (width: number): Boolean => {
    const [isWide, setIsWide] = useState(window.innerWidth >= width);
  
    useEffect(() => {
      const handleResize = () => {
        setIsWide(window.innerWidth >= width);
      };
  
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, [width]);
  
    return isWide;
  };