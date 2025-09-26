// // --- StopsPreview.tsx (inline inside MapView.tsx) ---
// import React, {useMemo, useRef, useState, useEffect} from 'react';
// import { createPortal } from 'react-dom';
// import styles from './MapView.module.css'; // ensure filename casing matches your file
// import ModalHeader from '../../UI/ModalHeader/ModalHeader';
// type Stop = {
//   name?: string;
//   code?: string;
//   city?: string;
//   address?: string;
//   state?: string;
//   pincode?: string;
// };

// type StopsPreviewProps = {
//   shipment: any; // keep broad; your MapShipment type may differ
//   anchorWithin?: HTMLElement | null; // optional: container used to compute positions
// };
// const getSIN = () =>
//   shipment?.sin ?? shipment?.SIN ?? shipment?.shipmentNumber ?? shipment?._id ?? '—';

// const formatStop = (s: Stop | undefined) => {
//   if (!s) return '—';
//   // Prefer name/code > city > address (tweak to your data)
//   const main = s.name || s.code || s.city || s.address || '—';
//   return main;
// };

// const useClickOutside = (ref: React.RefObject<HTMLElement>, onClose: () => void) => {
//   useEffect(() => {
//     const h = (e: MouseEvent) => {
//       if (!ref.current) return;
//       if (!ref.current.contains(e.target as Node)) onClose();
//     };
//     document.addEventListener('mousedown', h);
//     return () => document.removeEventListener('mousedown', h);
//   }, [ref, onClose]);
// };

// export const StopsPreview: React.FC<StopsPreviewProps> = ({ shipment, anchorWithin = null }) => {
//   const [popup, setPopup] = useState<{
//     type: 'pickup' | 'delivery';
//     items: Stop[];
//     x: number;
//     y: number;
//     above: boolean;
//   } | null>(null);

//   const popupRef = useRef<HTMLDivElement>(null);
//   useClickOutside(popupRef, () => setPopup(null));

//   // Robustly resolve arrays from your model (works if you have source/destination or arrays)
//   const { pickups, deliveries } = useMemo(() => {
//     const p: Stop[] =
//       shipment?.pickups ||
//       shipment?.multiPickups ||
//       shipment?.sources ||
//       (shipment?.source ? [shipment.source] : []) ||
//       [];
//     const d: Stop[] =
//       shipment?.deliveries ||
//       shipment?.multiDeliveries ||
//       shipment?.destinations ||
//       (shipment?.destination ? [shipment.destination] : []) ||
//       [];
//     return { pickups: Array.isArray(p) ? p : [], deliveries: Array.isArray(d) ? d : [] };
//   }, [shipment]);
//   const idxLabel = (type: 'pickup' | 'delivery', zeroBasedIndex: number) =>
//     (type === 'pickup' ? 'P' : 'D') + (zeroBasedIndex + 1);
  
//   const firstPickup = pickups[0];
//   const firstDelivery = deliveries[0];
//   const morePickups = Math.max((pickups?.length || 0) - 1, 0);
//   const moreDeliveries = Math.max((deliveries?.length || 0) - 1, 0);

//   const openList = (type: 'pickup' | 'delivery', ev: React.MouseEvent<HTMLElement>) => {
//     const el = ev.currentTarget as HTMLElement;
//     const rect = el.getBoundingClientRect();

//     // If your sidebar/container scrolls, computing relative to it helps.
//     // Fallback: viewport coords.
//     const base = anchorWithin?.getBoundingClientRect?.() ?? { left: 0, top: 0 };
//     const left = rect.left - base.left;
//     const top = rect.bottom - base.top;

//     const items = (type === 'pickup' ? pickups.slice(1) : deliveries.slice(1)) as Stop[];
//     const above = window.innerHeight - rect.bottom < 260; // if not enough space, pop above

//     setPopup({
//       type,
//       items,
//       x: left,
//       y: above ? rect.top - base.top : top,
//       above,
//     });
  
//   };

//   return (
//     <div className={styles.routeSection}>
//       {/* PICKUP ROW */}
//       <div className={styles.stopRow}>
//         <span className={`${styles.stopBadge} ${styles.pickupBadge}`}>{idxLabel('pickup', 0)}</span>
//         <div className={`${styles.stopPill} ${styles.pickupPill}`}>
//           <span className={styles.stopMainText}>{formatStop(firstPickup)}</span>
//           <span className={styles.stopMinorLabel}>Pickup</span>
//           {morePickups > 0 && (
//             <button
//               className={`${styles.extraCount} ${styles.extraGreen}`}
//               onClick={(e) => openList('pickup', e)}
//               title={`${morePickups} more pickup${morePickups > 1 ? 's' : ''}`}
//             >
//               +{morePickups}
//             </button>
//           )}
//         </div>
//       </div>

//       {/* dotted connector (optional) */}
//       <div className={styles.routeDots}>
//         <span></span><span></span><span></span>
//       </div>

//       {/* DELIVERY ROW */}
//       <div className={styles.stopRow}>
//         <span className={`${styles.stopBadge} ${styles.deliveryBadge}`}> {idxLabel('delivery', 0)}</span>
//         <div className={`${styles.stopPill} ${styles.deliveryPill}`}>
//           <span className={styles.stopMainText}>{formatStop(firstDelivery)}</span>
//           <span className={styles.stopMinorLabel}>Delivery</span>
//           {moreDeliveries > 0 && (
//             <button
//               className={`${styles.extraCount} ${styles.extraOrange}`}
//               onClick={(e) => openList('delivery', e)}
//               title={`${moreDeliveries} more delivery${moreDeliveries > 1 ? 'ies' : 'y'}`}
//             >
//               +{moreDeliveries}
//             </button>
//           )}
//         </div>
//       </div>

//       {/* PORTALED POPUP with remaining stops */}
//       {popup && popup.items.length > 0 &&
//         createPortal(
//           <div
//             ref={popupRef}
//             className={`${styles.actionMenu} ${popup.above ? styles.actionMenuAbove : ''} ${styles.stopsPopup}`}
//             style={{ left: popup.x, top: popup.y, maxWidth: 320 }}
//             role="dialog"
//             aria-label={popup.type === 'pickup' ? 'More pickups' : 'More deliveries'}
//           >
//             {/* <div className={styles.stopsPopupHead}>
//               <span className={popup.type === 'pickup' ? styles.pdPickupTitle : styles.pdDeliveryTitle}>
//                 {popup.type === 'pickup' ? 'Additional Pickups' : 'Additional Deliveries'}
//               </span>
//               <button className={styles.haltClose} onClick={() => setPopup(null)} aria-label="Close">×</button>
//             </div>
//             <div className={styles.haltDivider} /> */}
//             <ModalHeader
//   title={`${popup.type === 'pickup' ? 'Pickup Locations' : 'Delivery Locations'} • SIN: ${getSIN()}`}
//   onClose={() => setPopup(null)}
// />
//             <div className={styles.stopsPopupBody}>
//               {popup.items.map((s, idx) => (
//                 <div key={idx} className={styles.stopsPopupItem} title={formatStop(s)}>
//                   <span className={styles.stopsItemDot} />
//                   <span
//         className={`${styles.stopsItemIndex} ${popup.type === 'pickup' ? styles.extraGreen : styles.extraOrange}`}
//       >
//         {idxLabel(popup.type, idx + 1)} {/* +1 because p2/d2 starts after the first */}
//       </span>
//                   <div className={styles.stopsItemText}>
//                     <div className={styles.stopsItemName}>{formatStop(s)}</div>
//                     {s.address && <div className={styles.stopsItemMeta}>{s.address}</div>}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>,
//           document.body
//         )
//       }
//     </div>
//   );
// };
// ADD (or ensure) these imports at the top of MapView.tsx
// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { createPortal } from 'react-dom';
// import ModalHeader from '../../UI/ModalHeader/ModalHeader';
// import styles from './Mapview.module.css';

// // ===================== StopsPreview (copy/paste below your other code) =====================
// type Stop = {
//   name?: string;
//   code?: string;
//   city?: string;
//   address?: string;
//   state?: string;
//   pincode?: string;
// };

// type StopsPreviewProps = {
//   shipment: any;                       // pass your row/record here
//   anchorWithin?: HTMLElement | null;   // optional: container for positioning (e.g., sidebar)
// };

// const formatStop = (s: Stop | undefined) => {
//   if (!s) return '—';
//   return s.name || s.code || s.city || s.address || '—';
// };

// const idxLabel = (type: 'pickup' | 'delivery', zeroBasedIndex: number) =>
//   (type === 'pickup' ? 'p' : 'd') + (zeroBasedIndex + 1);

// const useClickOutside = (ref: React.RefObject<HTMLElement>, onClose: () => void) => {
//   useEffect(() => {
//     const h = (e: MouseEvent) => {
//       if (!ref.current) return;
//       if (!ref.current.contains(e.target as Node)) onClose();
//     };
//     document.addEventListener('mousedown', h);
//     return () => document.removeEventListener('mousedown', h);
//   }, [ref, onClose]);
// };

// export const StopsPreview: React.FC<StopsPreviewProps> = ({ shipment, anchorWithin = null }) => {
//   const [popup, setPopup] = useState<{
//     type: 'pickup' | 'delivery';
//     items: Stop[];
//     x: number;
//     y: number;
//     above: boolean;
//   } | null>(null);

//   const popupRef = useRef<HTMLDivElement>(null);
//   useClickOutside(popupRef, () => setPopup(null));

//   // Safe SIN once
//   const sin = useMemo(() => {
//     const s = shipment;
//     return s?.sin ?? s?.SIN ?? s?.shipmentNumber ?? s?._id ?? '—';
//   }, [shipment]);

//   // Resolve pickups/deliveries arrays from various shapes
//   const { pickups, deliveries } = useMemo(() => {
//     const p: any[] =
//       shipment?.pickups ??
//       shipment?.multiPickups ??
//       shipment?.sources ??
//       (shipment?.source ? [shipment.source] : []) ??
//       [];
//     const d: any[] =
//       shipment?.deliveries ??
//       shipment?.multiDeliveries ??
//       shipment?.destinations ??
//       (shipment?.destination ? [shipment.destination] : []) ??
//       [];
//     return { pickups: Array.isArray(p) ? p : [], deliveries: Array.isArray(d) ? d : [] };
//   }, [shipment]);

//   const firstPickup = pickups[0];
//   const firstDelivery = deliveries[0];
//   const morePickups = Math.max(pickups.length - 1, 0);
//   const moreDeliveries = Math.max(deliveries.length - 1, 0);

//   const openList = (type: 'pickup' | 'delivery', ev: React.MouseEvent<HTMLElement>) => {
//     const el = ev.currentTarget as HTMLElement;
//     const rect = el.getBoundingClientRect();
//     const base = anchorWithin?.getBoundingClientRect?.() ?? { left: 0, top: 0 };
//     const left = rect.left - base.left;
//     const top = rect.bottom - base.top;
//     const items = (type === 'pickup' ? pickups.slice(1) : deliveries.slice(1)) as Stop[];
//     const above = window.innerHeight - rect.bottom < 260;

//     setPopup({
//       type,
//       items,
//       x: left,
//       y: above ? rect.top - base.top : top,
//       above,
//     });
//   };

//   return (
//     <div className={styles.routeSection}>
//       {/* PICKUP ROW */}
//       <div className={styles.stopRow}>
//         <span className={`${styles.stopBadge} ${styles.stopBadgeWide} ${styles.pickupBadge}`}>
//           {idxLabel('pickup', 0)}
//         </span>
//         <div className={`${styles.stopPill} ${styles.pickupPill}`}>
//           <span className={styles.stopMainText}>{formatStop(firstPickup)}</span>
//           <span className={styles.stopMinorLabel}>Pickup</span>
//           {morePickups > 0 && (
//             <button
//               className={`${styles.extraCount} ${styles.extraGreen}`}
//               onClick={(e) => openList('pickup', e)}
//               title={`${morePickups} more pickup${morePickups > 1 ? 's' : ''}`}
//             >
//               +{morePickups}
//             </button>
//           )}
//         </div>
//       </div>

//       {/* dotted connector */}
//       <div className={styles.routeDots}>
//         <span></span><span></span><span></span>
//       </div>

//       {/* DELIVERY ROW */}
//       <div className={styles.stopRow}>
//         <span className={`${styles.stopBadge} ${styles.stopBadgeWide} ${styles.deliveryBadge}`}>
//           {idxLabel('delivery', 0)}
//         </span>
//         <div className={`${styles.stopPill} ${styles.deliveryPill}`}>
//           <span className={styles.stopMainText}>{formatStop(firstDelivery)}</span>
//           <span className={styles.stopMinorLabel}>Delivery</span>
//           {moreDeliveries > 0 && (
//             <button
//               className={`${styles.extraCount} ${styles.extraOrange}`}
//               onClick={(e) => openList('delivery', e)}
//               title={`${moreDeliveries} more deliver${moreDeliveries > 1 ? 'ies' : 'y'}`}
//             >
//               +{moreDeliveries}
//             </button>
//           )}
//         </div>
//       </div>

//       {/* POPUP with remaining stops */}
//       {popup && popup.items.length > 0 &&
//         createPortal(
//           <div
//             ref={popupRef}
//             className={`${styles.actionMenu} ${styles.stopsPopup} ${popup.above ? styles.actionMenuAbove : ''}`}
//             style={{ left: popup.x, top: popup.y, maxWidth: 320 }}
//             role="dialog"
//             aria-label={popup.type === 'pickup' ? 'More pickups' : 'More deliveries'}
//           >
//             <ModalHeader
//               title={`${popup.type === 'pickup' ? 'Pickup Locations' : 'Delivery Locations'} - #${sin}`}
//               onClose={() => setPopup(null)}
//             />
         
//             {/* <div className={styles.stopsPopupBody}>
//               {popup.items.map((s, idx) => (
//                 <div key={idx} className={styles.stopsPopupItem} title={formatStop(s)}>
//                   <span
//                     className={`${styles.stopsItemIndex} ${
//                       popup.type === 'pickup' ? styles.extraGreen : styles.extraOrange
//                     }`}
//                   >
//                     {idxLabel(popup.type, idx + 1)} }
//                   </span>
//                   <div className={styles.stopsItemText}>
//                     <div className={styles.stopsItemName}>{formatStop(s)}</div>
//                     {s?.address && <div className={styles.stopsItemMeta}>{s.address}</div>}
//                   </div>
//                 </div>
//               ))}
//             </div> */}
//             <div className={styles.stopsPopupBody}>
//   {popup.items.map((s, idx) => {
//     const typeLabel = popup.type === 'pickup' ? 'Pickup' : 'Delivery';
//     const pillClass = popup.type === 'pickup' ? styles.pickupPill : styles.deliveryPill;
//     const badgeClass = popup.type === 'pickup' ? styles.pickupBadge : styles.deliveryBadge;

//     return (
//       <div key={idx} className={styles.stopsPopupItem} title={formatStop(s)}>
//         {/* same style badge as first row, but with p2/d2… */}
//         <span className={`${styles.stopBadge} ${styles.stopBadgeWide} ${badgeClass}`}>
//           {idxLabel(popup.type, idx + 1)} {/* p2/d2... */}
//         </span>

//         {/* same pill style as first row, just slightly tighter */}
//         <div className={styles.stopsPopupDetail}>
//           <div className={`${styles.stopPill} ${styles.stopPillSmall} ${pillClass}`}>
//             <span className={styles.stopMainText}>{formatStop(s)}</span>
//             <span className={styles.stopMinorLabel}>{typeLabel}</span>
//           </div>

//           {/* optional second line for address/meta */}
//           {s?.address && <div className={styles.stopsItemMeta}>{s.address}</div>}
//         </div>
//       </div>
//     );
//   })}
// </div>

//           </div>,
//           document.body
//         )
//       }
//     </div>
//   );
// };
// ===================== /StopsPreview =====================

// USAGE EXAMPLE (where you render each card/row):
// <StopsPreview shipment={row} anchorWithin={document.querySelector(`.${styles.sidebar}`) as HTMLElement} />

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
// Use the same ModalHeader path you already use in Mapview.tsx
import ModalHeader from '@/components/UI/ModalHeader/ModalHeader';
import styles from './Mapview.module.css';

type Stop = {
  name?: string;
  code?: string;
  city?: string;
  address?: string;
  state?: string;
  pincode?: string;
  lat?: number | string;
  lng?: number | string;
};

type StopsPreviewProps = {
  shipment: any;
  anchorWithin?: HTMLElement | null;
  centered?: boolean;  
  /** Optional: set popup width (px). Default 360. */
  popupWidth?: number;
};
const getCity = (s?: any): string => {
  if (!s) return '';
  return (
    s.city ??
    s.city_name ??
    s.town ??
    s.district ??
    s.location_city ??
    (typeof s.address === 'string' ? '' : s.address?.city) ??
    ''
  );
};
// const formatStop = (s?: Stop) => {
//   if (!s) return '—';
//   return s.name || s.code || s.city || s.address || '—';
// };
const formatStop = (s?: Stop) => {
  if (!s) return '—';
  const nameOrCode = s.name || s.code || s.address || '';
  const city = getCity(s);

  // Avoid duplicates like "Chennai, Chennai"
  if (nameOrCode && city && nameOrCode.trim().toLowerCase() !== city.trim().toLowerCase()) {
    return `${nameOrCode} - ${city}`;
  }
  return nameOrCode || city || '—';
};

const idxLabel = (type: 'pickup' | 'delivery', zeroIndex: number) =>
  (type === 'pickup' ? 'P' : 'D') + (zeroIndex + 1);

const useClickOutside = (ref: React.RefObject<HTMLElement>, onClose: () => void) => {
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [ref, onClose]);
};

export const StopsPreview: React.FC<StopsPreviewProps> = ({
  shipment,
  anchorWithin = null,
  centered = false,             
  popupWidth = 360, // <— control width here
}) => {
  const [popup, setPopup] = useState<{
    type: 'pickup' | 'delivery';
    items: Stop[];
    x: number;
    y: number;
    above: boolean;
  } | null>(null);

  const popupRef = useRef<HTMLDivElement>(null);
  useClickOutside(popupRef, () => setPopup(null));

  // Safely compute SIN
  const sin = useMemo(() => {
    const s = shipment;
    return s?.sin ?? s?.SIN ?? s?.shipmentNumber ?? s?._id ?? '—';
  }, [shipment]);

  // 🔧 Map your arrays to pure `Stop` (peel `.location` if present)
  const { pickups, deliveries } = useMemo(() => {
    const rawP = (shipment?.pickups ?? shipment?.multiPickups ?? shipment?.sources ?? [])
      .map((x: any) => x?.location ?? x)
      .filter(Boolean);
    const rawD = (shipment?.deliveries ?? shipment?.multiDeliveries ?? shipment?.destinations ?? [])
      .map((x: any) => x?.location ?? x)
      .filter(Boolean);
    return {
      pickups: Array.isArray(rawP) ? rawP : [],
      deliveries: Array.isArray(rawD) ? rawD : [],
    };
  }, [shipment]);

  const firstPickup = pickups[0];
  const firstDelivery = deliveries[0];
  const morePickups = Math.max(pickups.length - 1, 0);
  const moreDeliveries = Math.max(deliveries.length - 1, 0);

  const openList = (type: 'pickup' | 'delivery', ev: React.MouseEvent<HTMLElement>) => {
    const el = ev.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const base = anchorWithin?.getBoundingClientRect?.() ?? { left: 0, top: 0 };
    const left = rect.left - base.left;
    const top = rect.bottom - base.top;
    const items = (type === 'pickup' ? pickups.slice(1) : deliveries.slice(1)) as Stop[];
    const above = window.innerHeight - rect.bottom < 260;

    setPopup({ type, items, x: left, y: above ? rect.top - base.top : top, above });
  };

  return (
    <div className={styles.routeSection}>
      {/* PICKUP ROW */}
      <div className={styles.stopRow}>
        <span className={`${styles.stopBadge} ${styles.stopBadgeWide} ${styles.pickupBadge}`}>
          {idxLabel('pickup', 0)}
        </span>
        <div className={`${styles.stopPill} ${styles.pickupPill}`}>
          <span className={styles.stopMainText}>{formatStop(firstPickup)}</span>
         
          {morePickups > 0 && (
            <button
              className={`${styles.extraCount} ${styles.extraGreen}`}
              onClick={(e) => openList('pickup', e)}
              title={`${morePickups} more pickup${morePickups > 1 ? 's' : ''}`}
            >
              +{morePickups}
            </button>
          )}
        </div>
      </div>

      {/* dotted connector */}
      <div className={styles.routeDots}>
        <span></span><span></span><span></span>
      </div>

      {/* DELIVERY ROW */}
      <div className={styles.stopRow}>
        <span className={`${styles.stopBadge} ${styles.stopBadgeWide} ${styles.deliveryBadge}`}>
          {idxLabel('delivery', 0)}
        </span>
        <div className={`${styles.stopPill} ${styles.deliveryPill}`}>
          <span className={styles.stopMainText}>{formatStop(firstDelivery)}</span>
          
          {moreDeliveries > 0 && (
            <button
              className={`${styles.extraCount} ${styles.extraOrange}`}
              onClick={(e) => openList('delivery', e)}
              title={`${moreDeliveries} more deliver${moreDeliveries > 1 ? 'ies' : 'y'}`}
            >
              +{moreDeliveries}
            </button>
          )}
        </div>
      </div>

      {/* POPUP */}
      {popup && popup.items.length > 0 &&
        createPortal(
          <>
      {centered && (
          <div
            ref={popupRef}
            className={`${styles.actionMenu} ${styles.stopsPopup} ${popup.above ? styles.actionMenuAbove : ''}`}
            style={{ left: popup.x, top: popup.y, width: popupWidth }} // ⬅️ width control
            role="dialog"
            aria-label={popup.type === 'pickup' ? 'More pickups' : 'More deliveries'}
          >
            <ModalHeader
              title={`${popup.type === 'pickup' ? 'Pickup Locations' : 'Delivery Locations'} - #${sin}`}
              onClose={() => setPopup(null)}
            />
          
            <div className={styles.stopsPopupBody}>
              {popup.items.map((s, idx) => {
                const typeLabel = popup.type === 'pickup' ? 'Pickup' : 'Delivery';
                const pillClass = popup.type === 'pickup' ? styles.pickupPill : styles.deliveryPill;
                const badgeClass = popup.type === 'pickup' ? styles.pickupBadge : styles.deliveryBadge;
                return (
                  <div key={idx} className={styles.stopsPopupItem} title={formatStop(s)}>
                    <span className={`${styles.stopBadge} ${styles.stopBadgeWide} ${badgeClass}`}   style={{ transform: 'translateY(6px)' }}>
                      {idxLabel(popup.type, idx + 1)} {/* p2/d2... */}
                    </span>
                    <div className={styles.stopsPopupDetail}>
                      <div className={`${styles.stopPill} ${styles.stopPillSmall} ${pillClass}`}>
                        <span className={styles.stopMainText}>{formatStop(s)}</span>
                        {/* <span className={styles.stopMinorLabel}>{typeLabel}</span> */}
                      </div>
                      {s?.address && <div className={styles.stopsItemMeta}>{s.address}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>)}
          </>,
          document.body
  
        )}
    </div>
  );
};
