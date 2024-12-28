"use client"

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { ThreeCircles } from "react-loader-spinner";
import { httpsGet } from "@/utils/Communication";
import './inPlantWagons.css';
import { Typography } from "@mui/material";

interface WagonData {
    id: number
    indentNumber: string
    eDemandNumber: string
    commodity: string
    wagonCount: number
    placementDateTime: string
    remainingFreeTime: string
    dcSlab: string
    timeElapsed: string
    dcCharges: number
}

const wagonData: WagonData[] = [
    {
        id: 1,
        indentNumber: '346',
        eDemandNumber: 'R3KN19722242',
        commodity: 'Steel',
        wagonCount: 48,
        placementDateTime: '19 Dec 18:30',
        remainingFreeTime: '00:00',
        dcSlab: '0-6 hrs',
        timeElapsed: '05:00',
        dcCharges: 36000
    },
    {
        id: 2,
        indentNumber: '345',
        eDemandNumber: 'R3KN19722242',
        commodity: 'Steel',
        wagonCount: 56,
        placementDateTime: '20 Dec 18:30',
        remainingFreeTime: '16:00',
        dcSlab: 'NA',
        timeElapsed: '00:00',
        dcCharges: 0
    }
]

const InPlantWagons = () => {
    const [loading, setLoading] = useState(true);
    const t = useTranslations("Dashboard");
    const router = useRouter();

    return (
        <main className="in-plant-wagons-main">
            <Typography
                variant="h4"
                gutterBottom
                sx={{
                    fontWeight: 'bold',
                    fontSize: '1.4rem',
                    color: '#2E2D32',
                    marginBottom: '24px',
                    letterSpacing: '1.54px',
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    textTransform: 'uppercase',
                }}>
                In Plant Wagons
            </Typography>

            <div className="in-plant-wagons-stats-grid">
                <div className="in-plant-wagons-stats-card">
                    <span className="in-plant-wagons-period">Yesterday</span>
                    <div className="in-plant-wagons-amount">
                        Rs.12L
                        <span className="in-plant-wagons-trend" data-trend="up">↑</span>
                    </div>
                </div>

                <div className="in-plant-wagons-stats-card">
                    <span className="in-plant-wagons-period">Today</span>
                    <div className="in-plant-wagons-amount">
                        Rs.3L
                        <span className="in-plant-wagons-trend" data-trend="up">↑</span>
                    </div>
                </div>

                <div className="in-plant-wagons-stats-card">
                    <span className="in-plant-wagons-period">Last month</span>
                    <div className="in-plant-wagons-amount">
                        Rs.15L
                        <span className="in-plant-wagons-trend" data-trend="down">↓</span>
                    </div>
                </div>

                <div className="in-plant-wagons-stats-card">
                    <span className="in-plant-wagons-period">This month</span>
                    <div className="in-plant-wagons-amount">
                        Rs.15L
                        <span className="in-plant-wagons-trend" data-trend="up">↑</span>
                    </div>
                </div>

                <div className="in-plant-wagons-stats-card">
                    <span className="in-plant-wagons-period">Last month This time</span>
                    <div className="in-plant-wagons-amount">
                        Rs.3L
                        <span className="in-plant-wagons-trend" data-trend="down">↓</span>
                    </div>
                </div>

                <div className="in-plant-wagons-stats-card">
                    <span className="in-plant-wagons-period">YTD</span>
                    <div className="in-plant-wagons-amount">
                        Rs.250L
                        <span className="in-plant-wagons-trend" data-trend="up">↑</span>
                    </div>
                </div>
            </div>

            <div className="in-plant-wagons-tableContainer">
                <table className="in-plant-wagons-table">
                    <thead>
                        <tr>
                            <th className="in-plant-wagons-id-column" style={{
                                width: '50px',
                            }}>#</th>
                            <th className="in-plant-wagons-id-column">
                                <span className="in-plant-wagons-id-column" style={{
                                    display: 'inline-block',
                                    paddingBottom: '4px'
                                }}>Indent #</span> <br />
                                <span className="in-plant-wagons-id-column">eDemand</span>
                            </th>
                            <th className="in-plant-wagons-id-column">
                                <span className="in-plant-wagons-id-column" style={{
                                    display: 'inline-block',
                                    paddingBottom: '4px'
                                }}>Commodity</span> <br />
                                <span className="in-plant-wagons-id-column">No. of Wagons</span>
                            </th>
                            <th className="in-plant-wagons-id-column">Placement Date Time</th>
                            <th className="in-plant-wagons-id-column">Remaining Free Time</th>
                            <th className="in-plant-wagons-id-column">DC Slab</th>
                            <th className="in-plant-wagons-id-column">Time elapsed beyond free time</th>
                            <th className="in-plant-wagons-id-column">DC Charges RS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {wagonData.map((row) => (
                            <tr key={row.id}>
                                <td>{row.id}</td>
                                <td>
                                    <span style={{
                                        display: 'inline-block',
                                        paddingBottom: '4px'
                                    }}>{row.indentNumber}</span> <br />
                                    <span>{row.eDemandNumber}</span>
                                </td>
                                <td>
                                    <span style={{
                                        display: 'inline-block',
                                        paddingBottom: '4px'
                                    }}>{row.commodity}</span> <br />
                                    <span>{row.wagonCount}</span>
                                </td>
                                <td>{row.placementDateTime}</td>
                                <td>{row.remainingFreeTime}</td>
                                <td>{row.dcSlab}</td>
                                <td>{row.timeElapsed}</td>
                                <td className={row.remainingFreeTime === '00:00' ? 'in-plant-wagons-charges' : ''}>{row.dcCharges.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
};

export default InPlantWagons;