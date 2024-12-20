"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { ThreeCircles } from "react-loader-spinner";
import { httpsGet } from '@/utils/Communication';
import './printableWagonTallySheet.css';

const initialState = {
    "wagonNo": "",
    "type": "",
    "cc": "",
    "tr": "",
    "material": "",
    "materialCode": "",
    "grade": "",
    "batchID": "",
    "heatNo": "",
    "width": "",
    "thick": "",
    "length": "",
    "sizeOrDiameter": "",
    "pcs": "",
    "PGIWt": "",
    "soNo": "",
    "lineItem": "",
    "obdNo": ""
}

const PrintableWagonTallySheet = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const shipmentId = searchParams.get("shipmentId");
    const [loading, setLoading] = useState(false);
    const text = useTranslations("WAGONTALLYSHEET");
    const [wagonTallySheetData, setWagonTallySheetData] = useState<any>([initialState]);
    const itemsPerPage = 20;
    const [pages, setPages] = useState(0);

    const handlePrint = () => {
        window.print();
    };

    async function getWagonTallySheetDetails() {
        try {
            setLoading(true);
            const response = await httpsGet(`get/all_wagon_tally_sheet?shipment=${shipmentId}`, 0, router);
            if (response.statusCode === 200) {
                setLoading(false);
                const wagonAllData = response?.data;
                if(wagonAllData && wagonAllData?.length > 0){
                    const wagonTallySheetData = wagonAllData.flatMap((wagon: any) => {
                        console.log(wagon, "wagon");
                        if (wagon.materials && wagon.materials.length > 0) {
                            return wagon.materials.map((material: any) => {
                                return {
                                    "wagonNo": wagon?.w_no || "N/A",
                                    "type": wagon?.wagon_type?.name || "N/A",
                                    "cc": wagon?.wagon_type?.capacity || "N/A",
                                    "tr": wagon?.wagon_type?.tare_weight || "N/A",
                                    "material": material?.material || "N/A",
                                    "materialCode": material?.code || "N/A",
                                    "grade": material?.grade || "N/A",
                                    "batchID": material?.batch_id || "N/A",
                                    "heatNo": material?.heat_no || "N/A",
                                    "width": material?.width || "N/A",
                                    "thick": material?.thick || "N/A",
                                    "length": material?.length || "N/A",
                                    "sizeOrDiameter": material?.size_or_diameter || "N/A",
                                    "pcs": material?.pieces || "N/A",
                                    "PGIWt": material?.pgi_tw_wrt || "N/A",
                                    "soNo": material?.so_no || "N/A",
                                    "lineItem": material?.line_item || "N/A",
                                    "obdNo": material?.obd_no || "N/A"
                                };
                            });
                        }
                        return []; // Return an empty array if there are no materials
                    });
                    console.log(wagonTallySheetData, "wagonTallySheetData");
                    setWagonTallySheetData(wagonTallySheetData);

                } else {
                    console.log("No data found");
                    setWagonTallySheetData([initialState]);
                }
            }
        } catch (error) {
            setLoading(false);
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getWagonTallySheetDetails();    
        console.log(shipmentId, "shipmentId");
    }, []);

    useEffect(() => {
        const pagesCount = Math.ceil(wagonTallySheetData.length / itemsPerPage);
        setPages(pagesCount);
        console.log(wagonTallySheetData.length, "Length of wagonTallySheetData");
    }, [wagonTallySheetData]);

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
            {Array.from({ length: pages }).map((_, pageIndex) => {
                const start = pageIndex * itemsPerPage;
                const end = start + itemsPerPage;
                const pageData = wagonTallySheetData.slice(start, end);
                console.log(pageData, "pageData");

                return (
                    <div className="page" key={pageIndex}>
                        <div className="wagon-waybill-a4-page">
                            <h1 className="wagon-waybill-title">
                                {text('wagonTallySheetDetails')}
                            </h1>
                            <div className="wagon-waybill-tables-container">
                                <table className="wagon-waybill-wagon-table">
                                    <thead>
                                        <tr>
                                            <th>{text('SNo')}</th>
                                            <th>{text('wagonNo')}</th>
                                            <th>{text('type')}</th>
                                            <th>{text('cc')}</th>
                                            <th>{text('tr')}</th>
                                            <th>{text('material')}</th>
                                            <th>{text('materialCode')}</th>
                                            <th>{text('grade')}</th>
                                            <th>{text('batchID')}</th>
                                            <th>{text('heatNo')}</th>
                                            <th>{text('width')}</th>
                                            <th>{text('thick')}</th>
                                            <th>{text('length')}</th>
                                            <th>{text('sizeOrDiameter')}</th>
                                            <th>{text('pcs')}</th>
                                            <th>{text('PGIWt')}</th>
                                            <th>{text('soNo')}</th>
                                            <th>{text('lineItem')}</th>
                                            <th>{text('obdNo')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pageData.map((item: any, index: number) => (
                                            <tr key={index}>
                                                <td>{start + index + 1}.</td>
                                                <td>{item.wagonNo || "N/A"}</td>
                                                <td>{item.type || "N/A"}</td>
                                                <td>{item.cc || "N/A"}</td>
                                                <td>{item.tr || "N/A"}</td>
                                                <td>{item.material || "N/A"}</td>
                                                <td>{item.material_code || "N/A"}</td>
                                                <td>{item.grade || "N/A"}</td>
                                                <td>{item.batch_id || "N/A"}</td>
                                                <td>{item.heat_no || "N/A"}</td>
                                                <td>{item.width || "N/A"}</td>
                                                <td>{item.thick || "N/A"}</td>
                                                <td>{item.length || "N/A"}</td>
                                                <td>{item.size_diameter || "N/A"}</td>
                                                <td>{item.pcs || "N/A"}</td>
                                                <td>{item.pgi_wt || "N/A"}</td>
                                                <td>{item.so_no || "N/A"}</td>
                                                <td>{item.line_item || "N/A"}</td>
                                                <td>{item.obd_no || "N/A"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="wagon-waybill-footer-section">
                                <button onClick={handlePrint} className="wagon-waybill-print-button">
                                    {text('print')}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PrintableWagonTallySheet;