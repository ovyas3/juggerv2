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