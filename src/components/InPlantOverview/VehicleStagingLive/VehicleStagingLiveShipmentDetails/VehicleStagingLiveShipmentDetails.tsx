"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import styles from "./VehicleStagingLiveShipmentDetails.module.css"
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/hooks/snackBar";
import { httpsPost } from "@/utils/Communication";
import { ThreeCircles } from "react-loader-spinner";
import service from "@/utils/timeService";
import { environment } from "@/environments/env.api";

interface ShipmentPopupProps {
    isOpen: boolean
    onClose: () => void
    title: string
    data: string[]
}

export default function VehicleStagingLiveShipmentDetails({ isOpen, onClose, title, data }: ShipmentPopupProps) {
    console.log(isOpen, onClose, title, data, "ShipmentPopupProps")
    const [isVisible, setIsVisible] = useState(false)
    const popupRef = useRef<HTMLDivElement>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter();
    const { showMessage } = useSnackbar();
    const [shipmentDetails, setShipmentDetails] = useState<any[]>([])

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true)
            document.body.style.overflow = "hidden"
        } else {
            setTimeout(() => {
                setIsVisible(false)
                document.body.style.overflow = ""
            }, 300)
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.body.style.overflow = ""
        }
    }, [isOpen, onClose])

    const getShipmentDetails = async () => {
        const payload = {
            drivers: data
        };

        try {
            setLoading(true);
            setShipmentDetails([]);
            const response = await httpsPost('reports/shipmentDetails', payload, router, 1, false);
            if (response.statusCode === 200) {
                const data = response.data;
                if (data && data.length > 0) {
                    const shipmentDetail: any[] = data.map((item: any, index: number) => {
                        const deliveryLocation =
                            item?.deliveries &&
                                item?.deliveries?.length > 0 &&
                                item?.deliveries[0] &&
                                item?.deliveries[0]?.location ? item?.deliveries[0]?.location : null;
                        const driver = item?.driver ? item?.driver : null;
                        const carrier = item?.carrier ? item?.carrier : null;
                        const eventTimeStamp =
                            item?.events &&
                                item?.events?.length > 0 &&
                                item?.events?.find((e: any) => e.event_name === 'DC') &&
                                item?.events?.find((e: any) => e.event_name === 'DC')?.event_timestamp ?
                                item?.events?.find((e: any) => e.event_name === 'DC')?.event_timestamp : null;
                        return {
                            id: index + 1,
                            sin: item?.SIN || '-',
                            trackerLink: item?.unique_code ? `${environment.TRACKER_URL}${item?.unique_code}` : '-',
                            vehicleNo: item?.vehicle_no || '-',
                            delivery_location:
                                deliveryLocation &&
                                    deliveryLocation?.city ?
                                    deliveryLocation.city : '-',
                            customer:
                                deliveryLocation &&
                                    deliveryLocation?.name ?
                                    deliveryLocation.name : '-',
                            driverName:
                                driver &&
                                    driver?.name ?
                                    driver.name : '-',
                            driverMobile:
                                driver &&
                                    driver?.mobile ?
                                    driver.mobile : '-',
                            obdNo:
                                driver &&
                                    driver?.preferred_load ?
                                    driver?.preferred_load : '-',
                            carrierName:
                                carrier &&
                                    carrier?.parent_name ?
                                    carrier?.parent_name : '-',
                            carrierReferenceId:
                                carrier &&
                                    carrier?.erp_reference &&
                                    carrier?.erp_reference?.length > 0 ?
                                    carrier?.erp_reference[carrier?.erp_reference?.length - 1]?.reference_id : '-',
                            dcEventDate:
                                eventTimeStamp ?
                                    service.utcToist(eventTimeStamp, "dd-MMM-yyyy") : '-',
                            dcEventTime:
                                eventTimeStamp ?
                                    service.utcToist(eventTimeStamp, "hh:mm") : '-',
                        }
                    })
                    setShipmentDetails(shipmentDetail)
                } else {
                    showMessage("No shipment details found", "error");
                    setShipmentDetails([])
                }
            }
            setLoading(false);
        } catch (err) {
            showMessage("Failed to fetch shipment details", "error");
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (data?.length > 0) {
            getShipmentDetails();
        }
    }, [data]);

    if (!isVisible && !isOpen) return null

    return (
        <>
            <div className={`${styles.overlay} ${isOpen ? styles.visible : ""}`}>
                {/* Loader */}
                {loading &&
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh',
                        position: 'absolute',
                        width: '100vw',
                        background: 'white',
                        zIndex: 1000,
                        opacity: 1
                    }}>
                        <ThreeCircles
                            visible={true}
                            height="100"
                            width="100"
                            color="#20114d"
                            ariaLabel="three-circles-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                        />
                    </div>
                }
                <div ref={popupRef} className={`${styles.popup} ${isOpen ? styles.visible : ""}`}>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                        <X size={20} strokeWidth={2.5} />
                    </button>
                    <div className={styles.header}>
                        <h2 className={styles.title}>{title}</h2>
                        <p className={styles.totalShipment}>Total Shipment: <b>{shipmentDetails.length}</b></p>
                    </div>
                    <div className={styles.content}>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.th}>S.No</th>
                                        <th className={styles.th}>SIN</th>
                                        <th className={styles.th}>Vehicle No.</th>
                                        <th className={styles.th}>Customer & Destination</th>
                                        <th className={styles.th}>Driver Details</th>
                                        <th className={styles.th}>OBD No.</th>
                                        <th className={styles.th}>OBD Created Date</th>
                                        <th className={styles.th}>Carrier</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shipmentDetails.map((item) => (
                                        <tr key={item.id} className={styles.tr}>
                                            <td className={styles.td}>{item.id}</td>
                                            <td className={styles.td}>
                                                <a href={`${item.trackerLink}`} target="_blank" rel="noopener noreferrer" className={styles.link}>
                                                    {item.sin}
                                                </a>
                                            </td>
                                            <td className={styles.td}>{item.vehicleNo}</td>
                                            <td className={styles.td}>
                                                <div className={styles.destinationCell}>
                                                    <span className={styles.customer}>{item.customer}</span>
                                                    <span className={styles.destination}>{item.delivery_location}</span>
                                                </div>
                                            </td>
                                            <td className={styles.td}>
                                                <div className={styles.driverCell}>
                                                    <span className={styles.driverName}>{item.driverName}</span>
                                                    <span className={styles.driverPhone}>{item.driverMobile}</span>
                                                </div>
                                            </td>
                                            <td className={styles.td} style={{
                                                width: '250px',
                                            }}>
                                                <p className={styles.obdNo}>
                                                    {item.obdNo}
                                                </p>
                                            </td>
                                            <td className={styles.td}>
                                                <span className={styles.dcEventDate}>{item.dcEventDate}</span>
                                                <span className={styles.dcEventTime}>{item.dcEventTime}</span>
                                            </td>
                                            <td className={styles.td} style={{
                                                width: '200px'
                                            }}>
                                                {`${item.carrierReferenceId} - ${item.carrierName}`}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

