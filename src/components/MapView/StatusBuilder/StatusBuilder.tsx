export const statusBuilder = (status: string) => {
  if (!status) return "In Plant";
  if(status.toLowerCase() === "delivered") {return "Delivered";}
  if(status.toLowerCase() === 'in plant')return "In Plant"
  return "In Transit"
  // return "In Plant";
}