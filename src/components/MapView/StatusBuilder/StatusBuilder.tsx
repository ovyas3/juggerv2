export const statusBuilder = (status: string) => {
  if (!status) return "In Plant";
  if(status.toLowerCase() === "delivered") {
    return "Delivered";
  }
  if(status === 'OB')
    return "In Plant"
  return "In Transit"
}