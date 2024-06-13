export const statusBuilder = (status: string) => {
  if (!status) return "In Plant"
  if(status.toLowerCase() === "delivered") {
    return "Delivered";
  }
  return "In Transit"
}