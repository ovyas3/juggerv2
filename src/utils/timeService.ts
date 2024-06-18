import { DateTime } from 'luxon';

const utcToist = (utc: string, format: string = 'dd-MM-yyyy') => {
  return DateTime.fromJSDate(new Date(utc)).plus({minutes: 330}).toFormat(format);
}

const utcToistTime = (utc: string, format: string = 'HH:mm') => {
  return DateTime.fromJSDate(new Date(utc)).plus({minutes: 330}).toFormat(format);
}

const millies = (utc: string) => {
    return DateTime.fromJSDate(new Date(utc)).plus({minutes: 330}).toMillis();
}

const getToday = () => {
    return DateTime.local().toISODate();
}

const diffrent = (start: string, end: string, type: string = 'days') => {
  // @ts-ignore
  return DateTime.fromJSDate(new Date(start)).diff(DateTime.fromJSDate(new Date(end)), type).toObject()[type];
}

const getTimeWithAMPM = (utc: string) => {
  return DateTime.fromJSDate(new Date(utc)).plus({minutes: 330}).toFormat('hh:mm a');
}

const service = {
  utcToist,
  millies,
  getToday,
  diffrent,
  getTimeWithAMPM,
  utcToistTime
}

export default service;