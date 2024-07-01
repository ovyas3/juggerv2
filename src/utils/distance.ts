import { getDistance } from 'geolib';

const distanceBetweenPoints = (point1: [number, number], point2: [number, number]) => {
    return getDistance({latitude: point1[1], longitude: point1[0]}, {latitude: point2[1], longitude: point2[0]});
}

const distanceBetweenMultiplePointsInKm = (points: [number, number][]) => {
    let distance = 0;
    for (let i = 0; i < points.length - 1; i++) {
        distance += distanceBetweenPoints(points[i], points[i + 1]);
    }
    return Number((distance / 1000).toFixed(2));
}

const distanceBetweenPointsInKm = (point1: [number, number], point2: [number, number]) => {
    return Number((distanceBetweenPoints(point1, point2) / 1000).toFixed());
}


export { distanceBetweenPoints, distanceBetweenMultiplePointsInKm, distanceBetweenPointsInKm };