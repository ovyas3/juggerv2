import React from "react";

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
    subLabel: string | React.ReactNode;
    label: string | React.ReactNode;
    class: string;
    innerClass: string;
}

export interface row {
  // [id]: any,
  _id:string
  edemand: {
    edemand_no: string
  },
  fnr: {
      primary: string,
      others: string,
      unique_code: string
  },
  destination: {
      locationId:string,
      name: string,
      code: string
  },
  material: string,
  pickupdate: {
      date: string
  },
  status: {
    name: string,
    code: string,
    raw: string
  },
  currentEta: string,
  remarks: {
    latest:string,
    rest : Array<Object>,
  },
  handlingAgent: string,
  action: string,
  validationForAttachRake: Boolean,
  fois:{
    is_gps: Boolean,
    is_fois:Boolean
  },
  rr_document: Array<any>
  pickup_date:string,
  eta:string,
  rrDoc: Boolean
  polyline: string
  no_of_wagons:number,
  received_no_of_wagons:number,
  is_captive:Boolean,
  daysAging:string,
  paid_by:string,
  commodity_desc:any,
  expected_loading_date:{
    ELDdate:string,
    ELDtime:string
  }
}

export interface tagItem {
  _id: string;
}

export interface Remarks {
  latest: {
    remark: string;
  };
  rest: any[];
}

export interface SeparatedRemarks {
 latest:Object,
 rest:Array<Object>
}