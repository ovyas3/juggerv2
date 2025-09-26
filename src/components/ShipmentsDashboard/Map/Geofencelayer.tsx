// GeofenceLayer.tsx
import { useEffect, useMemo, useState } from "react";
import { Polygon, InfoWindow } from "@react-google-maps/api";

type GeoFence =
  | { type: "Polygon"; coordinates: number[][][] }           // [ [ [lng,lat], ... ]  , [hole], ... ]
  | { type: "MultiPolygon"; coordinates: number[][][][] };   // [ [ [ring], [ring] ], [ [ring] ] ]

const INDIA_BBOX = { minLat: 5, maxLat: 38.9, minLng: 68, maxLng: 98 };
const inIndia = (lat: number, lng: number) =>
  lat >= INDIA_BBOX.minLat && lat <= INDIA_BBOX.maxLat &&
  lng >= INDIA_BBOX.minLng && lng <= INDIA_BBOX.maxLng;

function ringToPath(ring: number[][]): google.maps.LatLngLiteral[] {
  const path: google.maps.LatLngLiteral[] = [];
  for (const pt of ring || []) {
    if (!Array.isArray(pt) || pt.length < 2) continue;
    let lng = Number(pt[0]), lat = Number(pt[1]);

    // auto-swap if someone sent [lat,lng]
    if ((Math.abs(lat) > 60 && Math.abs(lng) <= 60) || lng < -180 || lng > 180) {
      [lat, lng] = [lng, lat];
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) continue;
    if (!inIndia(lat, lng)) continue;  // ignore out-of-India
    path.push({ lat, lng });
  }
  return path;
}

function geoFenceToPolygons(gf: GeoFence): google.maps.LatLngLiteral[][][] {
  const type = gf.type.toLowerCase();
  if (type === "polygon") {
    // Polygon → array of rings → paths: [outer, hole1, ...]
    const rings = (gf as any).coordinates as number[][][];
    const paths = rings.map(ringToPath).filter(r => r.length >= 3);
    return paths.length ? [paths] : [];
  }
  if (type === "multipolygon") {
    // MultiPolygon → array of polygons → each polygon is array of rings
    const polys = (gf as any).coordinates as number[][][][];
    const out: google.maps.LatLngLiteral[][][] = [];
    for (const rings of polys) {
      const paths = (rings || []).map(ringToPath).filter(r => r.length >= 3);
      if (paths.length) out.push(paths);
    }
    return out;
  }
  return [];
}

const GEOFENCE_STYLE: google.maps.PolygonOptions = {
  strokeColor: "#2563eb",
  strokeOpacity: 0.7,
  strokeWeight: 1.5,
  fillColor: "#3b82f6",
  fillOpacity: 0.18,
  clickable: true,
  zIndex: 30,
};

export default function GeofenceLayer({
  map,
  fences,
  labelKey,
}: {
  map: google.maps.Map | null;
  fences: GeoFence[];              // Array of Polygon/MultiPolygon
  labelKey?: string;               // optional: name to show in popup (if you wrap fences with metadata)
}) {
  const polys = useMemo(
    () => fences.flatMap(geoFenceToPolygons), // [[[outer,hole...]], [[outer], ...], ...]
    [fences]
  );

  // Fit once when shapes change
  // useEffect(() => {
  //   if (!map) return;
  //   const b = new google.maps.LatLngBounds();
  //   let added = 0;
  //   for (const paths of polys) {
  //     if (paths?.[0]?.length) {
  //       for (const pt of paths[0]) b.extend(pt);
  //       added++;
  //     }
  //   }
  //   if (added) map.fitBounds(b, 64);
  // }, [map, polys]);

  const [info, setInfo] = useState<{ pos: google.maps.LatLngLiteral; title?: string } | null>(null);

  return (
    <>
      {polys.map((paths, i) => (
        <Polygon
          key={i}
          paths={paths}                // supports holes when paths = [outer, hole1, ...]
          options={GEOFENCE_STYLE}
          onClick={(e) => {
            // Show popup where user clicked, or centroid of outer ring
            const pos =
              e?.latLng
                ? { lat: e.latLng.lat(), lng: e.latLng.lng() }
                : paths[0][Math.floor(paths[0].length / 2)];
            setInfo({ pos, title: labelKey });
          }}
        />
      ))}
{/* 
      {map && info && (
        <InfoWindow position={info.pos} onCloseClick={() => setInfo(null)}>
          <div style={{ minWidth: 180 }}>
            <div style={{ fontWeight: 800, color: "#2563eb", marginBottom: 6 }}>
              Geofence
            </div>
            <div style={{ fontSize: 12 }}>{info.title || "Polygon"}</div>
          </div>
        </InfoWindow>
      )} */}
    </>
  );
}
