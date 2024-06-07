import { DateTime } from "luxon";

export const INBOUND_API_URL =
  "https://prod-api.instavans.com/api/fois/v1/dummy/getShipment";
export const INBOUND_API_BULK =
  "https://prod-api.instavans.com/api/fois/v1/dummy/bulkUpload";
export const INBOUND_API_CONTACT_DETAILS =
  "https://prod-api.instavans.com/api/fois/v1/dummy/contact_details";
export const INBOUND_API_STATION_LIST =
  "https://prod-api.instavans.com/api/fois/v1/dummy/station_list";

export const formatDate = (date, format= "dd/MM/yyyy hh:mm a") => {
  return DateTime.fromJSDate(new Date(date)).toFormat(format);
}