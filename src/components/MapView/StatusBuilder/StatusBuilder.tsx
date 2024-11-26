export const statusBuilder = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'AVE': 'Open Indent',
    'RFD': 'Ready for Departure',
    'ITNS': 'In Transit',
    'Delivered': 'Delivered',
    'OB': 'In Plant',
    'INPL': 'In Plant',
    'CNCL': 'Cancelled'
  }
  return statusMap[status] || 'In Transit';
}