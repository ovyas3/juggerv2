// import { DateTime } from "luxon"; 

// export const INBOUND_API_URL =
//   "https://prod-api.instavans.com/api/fois/v1/dummy/getShipment";
// export const INBOUND_API_BULK =
//   "https://prod-api.instavans.com/api/fois/v1/dummy/bulkUpload";
// export const INBOUND_API_CONTACT_DETAILS =
//   "https://prod-api.instavans.com/api/fois/v1/dummy/contact_details";
// export const INBOUND_API_STATION_LIST =
//   "https://prod-api.instavans.com/api/fois/v1/dummy/station_list";


// export const formatDate = (date : any, format= "dd/MM/yyyy hh:mm a") :any => {
//   return DateTime.fromJSDate(new Date(date)).toFormat(format);
// }

export const GET_SHIPMENTS = 'rake_shipment/getShipment';
export const CAPTIVE_RAKE = 'rake_shipment/get/captive_rakes';
export const UPDATE_RAKE_CAPTIVE_ID = 'rake_shipment/update_rake_captive_id';