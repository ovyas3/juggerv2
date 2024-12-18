'use client'
import React, { useState, useEffect } from "react";
import './wagonWayBill.css';
import { httpsGet } from "@/utils/Communication";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { ThreeCircles } from "react-loader-spinner";

interface shipmentDetails {
    rakeNo: string;
    lineNo: string;
    from: string;
    to: string;
    commodity: string;
    indentNo: string;
}

interface wagonDetails {
    wagonNumber: string;
    wagonType: string;
    isLoaded: string;
    ccWeight: string;
    tareWeight: string;
}

const PrintableWagonWayBill = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const shipmentId = searchParams.get("shipmentId");
    const [loading, setLoading] = useState(false);
    const [loadingDate, setLoadingDate] = useState<Date | null>(new Date());
    const [todayDate, setTodayDate] = useState<Date | null>(new Date());
    const [shipmentDetails, setShipmentDetails] = useState<shipmentDetails>({
        rakeNo: "",
        lineNo: "",
        from: "",
        to: "",
        commodity: "",
        indentNo: "",
    });
    const [wagonDetails, setWagonDetails] = useState<wagonDetails[]>([
        {
            wagonNumber: "",
            wagonType: "",
            isLoaded: "",
            ccWeight: "",
            tareWeight: "",
        },
    ]);
    const text = useTranslations("WAGON_WAY_BILL");


    const handlePrint = () => {
        window.print();
    };

    async function getWagonWayBillDetails() {
        try {
            setLoading(true);
            const response = await httpsGet(`get/wagon_way_bill/details?shipment=${shipmentId}`, 0, router);
            if (response.statusCode === 200) {
                setLoading(false);
                console.log(response?.data, "response?.data");
                const shipment = response?.data && response?.data?.shipment ? response?.data?.shipment : {};
                const wagons = response?.data && response?.data?.wagon ? response?.data?.wagon : [];
                let shipmentDetails = {
                    rakeNo: "",
                    lineNo: "",
                    from: "",
                    to: "",
                    commodity: "",
                    indentNo: "",
                };
                let wagonDetails = [
                    {
                        wagonNumber: "",
                        wagonType: "",
                        isLoaded: "",
                        ccWeight: "",
                        tareWeight: "",
                    },
                ];

                if (shipment) {
                    shipmentDetails = {
                        rakeNo: shipment?.rake_no ? shipment?.rake_no : "",
                        lineNo: shipment?.line_no ? shipment?.line_no : "",
                        from: shipment?.pickup_location && shipment?.pickup_location.code ? shipment?.pickup_location.code : "",
                        to: shipment?.delivery_location && shipment?.delivery_location.code ? shipment?.delivery_location.code : "",
                        commodity: shipment?.others && shipment?.others.demandedCommodity ? shipment?.others.demandedCommodity : "",
                        indentNo: shipment?.indent_no ? shipment?.indent_no : "",
                    }
                }

                if (wagons) {
                    wagonDetails = wagons.map((wagon: any) => {
                        return {
                            wagonNumber: wagon?.w_no ? wagon?.w_no : "N/A",
                            wagonType: wagon?.wagon_type && wagon?.wagon_type.name ? wagon?.wagon_type.name : "N/A",
                            isLoaded: wagon?.is_loaded ? wagon?.is_loaded : "N/A",
                            ccWeight: wagon?.wagon_type && wagon?.wagon_type.capacity ? wagon?.wagon_type.capacity : "N/A",
                            tareWeight: wagon?.wagon_type && wagon?.wagon_type.tare_weight ? wagon?.wagon_type.tare_weight : "N/A",
                        }
                    })
                }
                // if (wagons) {
                //     const initialWagonDetails = wagons.map((wagon: any) => {
                //         return {
                //             wagonNumber: wagon?.w_no ? wagon?.w_no : "N/A",
                //             wagonType: wagon?.wagon_type && wagon?.wagon_type.name ? wagon?.wagon_type.name : "N/A",
                //             isLoaded: wagon?.is_loaded ? wagon?.is_loaded : "N/A",
                //             ccWeight: wagon?.wagon_type && wagon?.wagon_type.capacity ? wagon?.wagon_type.capacity : "N/A",
                //             tareWeight: wagon?.wagon_type && wagon?.wagon_type.tare_weight ? wagon?.wagon_type.tare_weight : "N/A",
                //         };
                //     });

                //     // Duplicate the entries until we have at least 50
                //     wagonDetails = [];
                //     while (wagonDetails.length < 60) {
                //         wagonDetails = wagonDetails.concat(initialWagonDetails);
                //     }

                //     // Trim to exactly 50 if we have more than 50
                //     wagonDetails = wagonDetails.slice(0, 60);
                // }
                console.log(wagonDetails, "wagonDetails");
                console.log(shipmentDetails, "shipmentDetails");
                setShipmentDetails(shipmentDetails);
                setWagonDetails(wagonDetails);
                setLoadingDate(new Date());
                setTodayDate(new Date());
            }
        } catch (error) {
            setLoading(false);
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        console.log(shipmentId, "shipmentId");
        getWagonWayBillDetails();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
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
        );
    }

    return (
        <div className="wagon-waybill-print-container">
            <div className="wagon-waybill-a4-page">
                <h1 className="wagon-waybill-title">
                    {text('wagonWayBill')}
                </h1>
                <div className="wagon-waybill-header-section">
                    <div className="wagon-waybill-header-row">
                        <div className="wagon-waybill-field-group">
                            <label>{text('rakeNo')}</label>
                            <input
                                type="text"
                                value={shipmentDetails?.rakeNo}
                                onChange={(e) => setShipmentDetails({ ...shipmentDetails, rakeNo: e.target.value })}
                            />
                        </div>
                        <div className="wagon-waybill-field-group">
                            <label>{text('date')}</label>
                            <input
                                type="date"
                                value={loadingDate?.toISOString().split('T')[0]}
                                onChange={(e) => setLoadingDate(new Date(e.target.value))}
                            />
                        </div>
                        <div className="wagon-waybill-field-group">
                            <label>{text('lineNo')}</label>
                            <input
                                type="text"
                                value={shipmentDetails?.lineNo}
                                onChange={(e) => setShipmentDetails({ ...shipmentDetails, lineNo: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="wagon-waybill-header-row">
                        <div className="wagon-waybill-field-group">
                            <label>{text('from')}</label>
                            <input
                                type="text"
                                value={shipmentDetails?.from}
                                onChange={(e) => setShipmentDetails({ ...shipmentDetails, from: e.target.value })}
                            />
                        </div>
                        <div className="wagon-waybill-field-group">
                            <label>{text('to')}</label>
                            <input
                                type="text"
                                value={shipmentDetails?.to}
                                onChange={(e) => setShipmentDetails({ ...shipmentDetails, to: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="wagon-waybill-header-row">
                        <div className="wagon-waybill-field-group">
                            <label>{text('commodity')}</label>
                            <input
                                type="text"
                                value={shipmentDetails?.commodity}
                                onChange={(e) => setShipmentDetails({ ...shipmentDetails, commodity: e.target.value })}
                            />
                        </div>
                        <div className="wagon-waybill-field-group">
                            <label>{text('indentNo')}</label>
                            <input
                                type="text"
                                value={shipmentDetails?.indentNo}
                                onChange={(e) => setShipmentDetails({ ...shipmentDetails, indentNo: e.target.value })}
                            />
                        </div>
                        <div className="wagon-waybill-field-group">
                            <label>{text('date')}</label>
                            <input
                                type="date"
                                value={todayDate?.toISOString().split('T')[0]}
                                onChange={(e) => setTodayDate(new Date(e.target.value))}
                            />
                        </div>
                    </div>
                </div>

                <div className="wagon-waybill-tables-container">
                    <table className="wagon-waybill-wagon-table">
                        <thead>
                            <tr>
                                <th>{text('SNo')}</th>
                                <th>{text('wagonNo')}</th>
                                <th>{text('type')}</th>
                                <th>{text('isLoaded')}</th>
                                <th>{text('cc')}</th>
                                <th>{text('tr')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wagonDetails.slice(0, 30).map((wagon, index) => (
                                <tr key={index}>
                                    <td>{index + 1}.</td>
                                    <td>{wagon.wagonNumber}</td>
                                    <td>{wagon.wagonType}</td>
                                    <td>{wagon.isLoaded}</td>
                                    <td>{wagon.ccWeight}</td>
                                    <td>{wagon.tareWeight}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {wagonDetails && wagonDetails.length > 30 ? (
                        <table className="wagon-waybill-wagon-table">
                            <thead>
                                <tr>
                                    <th>{text('SNo')}</th>
                                    <th>{text('wagonNo')}</th>
                                    <th>{text('type')}</th>
                                    <th>{text('isLoaded')}</th>
                                    <th>{text('cc')}</th>
                                    <th>{text('tr')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wagonDetails.slice(30).map((wagon, index) => (
                                    <tr key={index + 31}>
                                        <td>{index + 31}.</td>
                                        <td>{wagon.wagonNumber}</td>
                                        <td>{wagon.wagonType}</td>
                                        <td>{wagon.isLoaded}</td>
                                        <td>{wagon.ccWeight}</td>
                                        <td>{wagon.tareWeight}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="wagon-waybill-wagon-table"></table>
                    )
                    }
                </div>
                <div className="wagon-waybill-footer-section">
                    <button onClick={handlePrint} className="wagon-waybill-print-button">
                        {text('print')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PrintableWagonWayBill;