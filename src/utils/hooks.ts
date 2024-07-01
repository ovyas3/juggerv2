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

export const sortArray = (inputArray: Array<Object>, parameter: string = 'pickup_date', type: 'asc' | 'dec' = 'dec'): Array<Object> => {
  if (!Array.isArray(inputArray) || inputArray.length === 0) {
    return [];
  }
  const sortedArray = [...inputArray].sort((a: any, b: any) => {
    const dateA = a[parameter] ? new Date(a[parameter]) : null;
    const dateB = b[parameter] ? new Date(b[parameter]) : null;

    // If both dates are missing, maintain original order
    if (!dateA && !dateB) return 0;

    // If dateA is missing, move it to the end
    if (!dateA) return 1;

    // If dateB is missing, move it to the end
    if (!dateB) return -1;

    // If both dates are valid, compare them
    if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
      return type === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    }

    // If we reach here, treat them as equal
    return 0;
  });

  return sortedArray;
}