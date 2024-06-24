import { DateTime } from 'luxon';

const utcToist = (utc: string, format: string = 'dd-MM-yyyy') => {
  const date = DateTime.fromJSDate(new Date(utc)).setZone('Asia/Calcutta').toFormat(format);
  if (date === 'Invalid DateTime') {
    return 'N/A';
  }
  return date;
}

const utcToistTime = (utc:string, format = 'hh:mm a') => {
  const date = DateTime.fromJSDate(new Date(utc)).setZone('Asia/Calcutta').toFormat(format);
  if (date === 'Invalid DateTime') {
    return 'N/A';
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
  return DateTime.fromJSDate(new Date(end)).setZone('Asia/Calcutta').diff(DateTime.fromJSDate(new Date()).minus({hours: difference}), type).toObject()[type];
}

const getTimeWithAMPM = (utc: string) => {
  return DateTime.fromJSDate(new Date(utc)).setZone('Asia/Calcutta').toFormat('hh:mm a');
}

const service = {
  utcToist,
  millies,
  getToday,
  diffrent,
  getTimeWithAMPM,
  utcToistTime,
  differenceToday
}

export default service;