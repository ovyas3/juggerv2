'use client'
import {useState, useEffect} from 'react'
import {SeparatedRemarks} from '@/utils/interface'

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
      return type === 'dec' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    }

    // If we reach here, treat them as equal
    return 0;
  });

  return sortedArray;
}

export const  separateLatestObject = (dataArray: Array<Object>) : any => {
  if (!dataArray || dataArray.length === 0) {
    return { latest: null, rest: [] };
  }

  // Sort the array by date in descending order
  const sortedArray = dataArray.sort((a:any, b:any) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // The first element is the latest
  const latest = sortedArray[0];

  // The rest of the elements
  const rest = sortedArray.slice(1);

  return { latest, rest };
}

export function calculateDaysDifference(demandDate: string | null): number | "NA" {
  if (!demandDate) {
      return "NA";
  }

  try {
      const demand = new Date(demandDate);
      const today = new Date();

      if (isNaN(demand.getTime())) {
          return "NA";
      }

      // Set both dates to the start of the day for accurate day calculation
      demand.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const differenceInTime = Math.abs(today.getTime() - demand.getTime());
      const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));

      return differenceInDays;
  } catch (error) {
      return "NA";
  }
}
