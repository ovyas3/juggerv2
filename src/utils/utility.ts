export const fetchStatusColorByCode = (status_code:any) => {
    const colorCodes = JSON.parse(localStorage.getItem('preferences') || '')
    if(colorCodes) {
        return colorCodes[status_code]
    }
    return '#000000'
}