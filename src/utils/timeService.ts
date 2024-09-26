import { DateTime } from 'luxon';

const utcToist = (utc: string, format: string = 'dd-MM-yyyy') => {
  const date = DateTime.fromJSDate(new Date(utc)).setZone('Asia/Calcutta').toFormat(format);
  if (date === 'Invalid DateTime') {
    return 'NA';
  }
  return date;
}

const utcToistTime = (utc:string, format = 'hh:mm a') => {
  const date = DateTime.fromJSDate(new Date(utc)).setZone('Asia/Calcutta').toFormat(format);
  if (date === 'Invalid DateTime') {
    return 'NA';
  }
  return date;
}

const millies = (utc: string) => {
    return DateTime.fromJSDate(new Date(utc)).setZone('Asia/Calcutta').toMillis();
}

const getToday = () => {
    return DateTime.local().toISODate();
}

const diffrent = (start: string, end: string, type: string = 'days') => {
  // @ts-ignore
  return DateTime.fromJSDate(new Date(start)).diff(DateTime.fromJSDate(new Date(end)), type).toObject()[type];
}

const differenceToday = (end: string, difference: number = 0, type: string = 'days') => {
  // @ts-ignore
  return DateTime.fromJSDate(new Date(end)).setZone('Asia/Calcutta').diff(DateTime.fromJSDate(new Date()), type).toObject()[type];
}

const getTimeWithAMPM = (utc: string) => {
  return DateTime.fromJSDate(new Date(utc)).setZone('Asia/Calcutta').toFormat('hh:mm a');
}

const getLocalTime = (date:any, format: string = 'dd MM yyyy') => {
  return DateTime.fromJSDate(new Date(date)).setZone('Asia/Calcutta').toFormat('hh:mm a');
}

const getEpoch = (date:any) => {
  return DateTime.fromJSDate(new Date(date)).toUTC();
}

const formatDate = (dateInput: any) => {
  const days = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", 
                "11th", "12th", "13th", "14th", "15th", "16th", "17th", "18th", "19th", "20th",
                "21st", "22nd", "23rd", "24th", "25th", "26th", "27th", "28th", "29th", "30th", "31st"];
  const months = ["January", "February", "March", "April", "May", "June", "July", 
                  "August", "September", "October", "November", "December"];
  const date = new Date(dateInput);
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  return ` ${formattedTime}, ${days[day - 1]} ${months[month]} ${year}`;
}


const service = {
  utcToist,
  millies,
  getToday,
  diffrent,
  getTimeWithAMPM,
  utcToistTime,
  differenceToday,
  getLocalTime,
  getEpoch,
  formatDate
}

export default service;