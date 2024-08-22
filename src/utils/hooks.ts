'use client'
import { useState, useEffect } from 'react'
import { SeparatedRemarks } from '@/utils/interface'

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

export const separateLatestObject = (dataArray: Array<Object>): any => {
  if (!dataArray || dataArray.length === 0) {
    return { latest: null, rest: [] };
  }

  // Sort the array by date in descending order
  const sortedArray = dataArray.sort((a: any, b: any) =>
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

export function countTracking(arr: any[]) {
  // Initialize counts
  let trackingCount = 0;
  let nonTrackingCount = 0;

  // Iterate over each item in the array
  arr.forEach((shipment: any) => {
    const gps = shipment.trip_tracker?.last_location?.fois?.coordinates.length > 0 && shipment.trip_tracker?.last_location?.fois ||
      shipment.trip_tracker?.last_location?.gps.coordinates.length > 0 && shipment.trip_tracker?.last_location?.gps;
    const isTracking = gps && gps.coordinates && gps.coordinates.length > 0;

    if (isTracking) {
      trackingCount++;
    } else {
      nonTrackingCount++;
    }
  });

  // Return an object with counts
  return {
    tracking: trackingCount,
    notTracking: nonTrackingCount
  };
}

const ageingCode = [
  { color: 'green', code: '#18BE8A', text: '1-2 days' },
  { color: 'yellow', code: '#FFD60A', text: '3-6 days' },
  { color: 'orange', code: '#FF9800', text: '6-9 days' },
  { color: 'red', code: '#E6667B', text: '≥10 days' },
];

export function getColorCode(days: any) {
  if (days >= 1 && days <= 2) {
    return ageingCode[0].code;
  } else if (days >= 3 && days <= 6) {
    return ageingCode[1].code;
  } else if (days >= 7 && days <= 9) {
    return ageingCode[2].code;
  } else if (days >= 10) {
    return ageingCode[3].code;
  } else {
    return '#FFFFFF';
  }
}

export function getUniqueValues(arr: any) {
  return [...new Set(arr)];
}

export function getShipmentStatusSummary(shipments: any) {
  const summary = {
    total: shipments.length,
    inTransit: 0,
    inPlant: 0,
    delivered: 0
  };

  for (const shipment of shipments) {
    if (!shipment.status) {
      summary.inPlant++;
    } else if (shipment.status.toLowerCase() === 'delivered') {
      summary.delivered++;
    } else {
      summary.inTransit++;
    }
  }

  return summary;
}



export function processETAs(dates: any) {
  if (!dates || dates.length === 0) {
    return {
      currentETA: 'NA',
      initialETA: 'NA'
    };
  }

  // Helper function to safely parse dates
  const parseDate = (dateString: any): number => {
    if (dateString instanceof Date) {
      return dateString.getTime();
    }
    const parsed = new Date(dateString).getTime();
    return isNaN(parsed) ? 0 : parsed;
  };

  const dateTimes = dates.map(parseDate);
  const maxTime = Math.max(...dateTimes);
  const minTime = Math.min(...dateTimes);

  return {
    currentETA: maxTime ? new Date(maxTime).toISOString() : 'NA',
    initialETA: minTime ? new Date(minTime).toISOString() : 'NA'
  };
}

export function getCaptiveIndianRakes(arr: any[]) {
  let captiveCount = 0;
  let indianCount = 0;

  arr.forEach((shipment: any) => {
    const isCaptive = shipment?.is_captive;
    if (isCaptive) {
      captiveCount++;
    } else {
      indianCount++;
    }
  })
  return {
    captive: captiveCount,
    indian: indianCount
  }
}

export function trackingByFoisGpsHook(arr: any[]) {
  let foiscount = 0;
  let gpscount = 0;
  arr.forEach((shipment: any) => {
    if (shipment.trip_tracker?.last_location?.fois?.coordinates?.length > 0) {
      foiscount++;
    } else if (shipment.trip_tracker?.last_location?.gps?.coordinates?.length > 0) {
      gpscount++;
    }

  })
  return { gpscount, foiscount }
}