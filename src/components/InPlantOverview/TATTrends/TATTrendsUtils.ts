import { DateTime } from "luxon"


export const getDateRange = (xlineChartData: any) => {
    const startDate = DateTime.fromISO(
        xlineChartData[0] instanceof Date ? xlineChartData[0].toISOString() : xlineChartData[0]
    );
    const endDate = DateTime.fromISO(
        xlineChartData[xlineChartData.length - 1] instanceof Date ? xlineChartData[xlineChartData.length - 1].toISOString() : xlineChartData[xlineChartData.length - 1]
    );
    const daysDiff = endDate.diff(startDate, "days").days;
    return { startDate, endDate, daysDiff };
}

export const aggregateData = (data: number[], xlineChartData: any, period: "day" | "week" | "month") => {
    const { startDate, endDate } = getDateRange(xlineChartData)
    let intervalStart = startDate
    const aggregatedData: number[] = []

    while (intervalStart <= endDate) {
        let intervalEnd: DateTime
        if (period === "day") {
            intervalEnd = intervalStart.endOf("day")
        } else if (period === "week") {
            intervalEnd = intervalStart.endOf("week")
        } else {
            intervalEnd = intervalStart.endOf("month")
        }

        const intervalData = data.slice(
            Math.max(0, startDate.diff(intervalStart, "days").days),
            Math.min(data.length, startDate.diff(intervalEnd, "days").days + 1),
        )

        if (intervalData.length > 0) {
            aggregatedData.push(intervalData.reduce((sum, value) => sum + value, 0) / intervalData.length)
        }

        intervalStart = intervalEnd.plus({ days: 1 })
    }

    return aggregatedData
}

export const getAggregatedLabels = (xlineChartData: any, period: "day" | "week" | "month") => {
    const { startDate, endDate } = getDateRange(xlineChartData)
    let intervalStart = startDate
    const labels: string[] = []

    while (intervalStart <= endDate) {
        if (period === "day") {
            labels.push(intervalStart.toFormat("MMM d"))
            intervalStart = intervalStart.plus({ days: 1 })
        } else if (period === "week") {
            labels.push(`Week ${intervalStart.weekNumber}`)
            intervalStart = intervalStart.plus({ weeks: 1 })
        } else {
            labels.push(intervalStart.toFormat("MMM yyyy"))
            intervalStart = intervalStart.plus({ months: 1 })
        }
    }

    return labels
}



export const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

