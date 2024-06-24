export interface ShipmentsObjectPayload  {
    is_outbound: Boolean,
    from: string,
    to:string,
    status: string,
    fnrNumber:string,
    eDemand:string,
    limit:number,
    skip:number
  }

export  interface Column {
    id: string;
    label: string | React.ReactNode;
    class: string;
    innerClass: string;
}

export interface row {
  // [id]: any,
  _id:string
  edemand: string,
  fnr: {
      primary: string,
      others: string,
      unique_code: string
  },
  destination: {
      name: string,
      code: string
  },
  material: string,
  pickupdate: {
      date: string
  },
  status: string,
  currentEta: string,
  remarks: string,
  handlingAgent: string,
  action: string,
  validationForAttachRake: Boolean,
  fois:{
    is_gps: Boolean,
    is_fois:Boolean
  },

}