export const statusBuilder = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'AVE': 'Available eIndent',
    'RFD': 'Ready for Departure',
    'ITNS': 'In Transit',
    'Delivered': 'Delivered',
    'OB': 'In Plant',
     '': 'In Plant'
  }
  return statusMap[status] || 'In Transit';
}