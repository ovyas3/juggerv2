'use client'

import { useState } from 'react'
import styles from './mobileEWayBillDashboard.module.css'
import { ChevronDown } from '../EWayBillDashboardIcons'

interface Ewaybill {
    id: string
    number: string
    carrierName: string
    customerName: string
    customerAddress: string
    doNumber: string
    remainingDistance: number
    expiryTime: Date
}

export default function MobileEwaybillDashboard() {
    const [ewaybills] = useState<Ewaybill[]>(mockEwaybills)
    const [searchTerm, setSearchTerm] = useState("")
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)

    // Filter ewaybills
    const filteredEwaybills = ewaybills.filter(ewaybill =>
        ewaybill.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ewaybill.carrierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ewaybill.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const toggleDropdown = (id: string) => {
        setOpenDropdown(openDropdown === id ? null : id)
    }

    return (
        <div className={styles.mobileEwaybillcontainer}>
            <div className={styles.mobileEwaybillheader}>
                <h1>eWayBill Dashboard</h1>
            </div>

            <div className={styles.mobileEwaybillsearchContainer}>
                <input
                    type="text"
                    placeholder="Search e-waybills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.mobileEwaybillsearchInput}
                />
                <div className={styles.mobileEwaybillresultCount}>
                    Displaying {filteredEwaybills.length} e-waybills
                </div>
            </div>

            <div className={styles.mobileEwaybillmobileCardGrid}>
                {filteredEwaybills.map((ewaybill) => (
                    <div key={ewaybill.id} className={styles.mobileEwaybillcard}>
                        <div className={styles.mobileEwaybillcardHeader}>
                            <div className={styles.mobileEwaybillnumber}>{ewaybill.number}</div>
                            <div className={styles.mobileEwaybillexpiryTime}>
                                Expires: {ewaybill.expiryTime.toLocaleString()}
                            </div>
                        </div>

                        <div className={styles.mobileEwaybillcardContent}>
                            <div className={styles.mobileEwaybillinfoRow}>
                                <div className={styles.mobileEwaybilllabel}>Carrier Name</div>
                                <div className={styles.mobileEwaybillvalue}>{ewaybill.carrierName}</div>
                            </div>

                            <div className={styles.mobileEwaybillinfoRow}>
                                <div className={styles.mobileEwaybilllabel}>DO Number</div>
                                <div className={styles.mobileEwaybillvalue}>{ewaybill.doNumber}</div>
                            </div>

                            <div className={styles.mobileEwaybillinfoRow}>
                                <div className={styles.mobileEwaybilllabel}>Distance Left</div>
                                <div className={styles.mobileEwaybillvalue}>{ewaybill.remainingDistance} km</div>
                            </div>

                            <div className={styles.mobileEwaybillcustomerSection}>
                                <button
                                    className={styles.mobileEwaybillcustomerButton}
                                    onClick={() => toggleDropdown(ewaybill.id)}
                                >
                                    <span>Customer Details</span>
                                    <ChevronDown className={openDropdown === ewaybill.id ? styles.mobileEwaybillrotated : ''} />
                                </button>

                                {openDropdown === ewaybill.id && (
                                    <div className={styles.mobileEwaybillcustomerDetails}>
                                        <div className={styles.mobileEwaybillcustomerName}>
                                            {ewaybill.customerName}
                                        </div>
                                        <div className={styles.mobileEwaybillcustomerAddress}>
                                            {ewaybill.customerAddress}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const mockEwaybills = [
    {
        id: "1",
        number: "EWB1234567890",
        carrierName: "FastTrack Logistics",
        customerName: "Acme Corp",
        customerAddress: "123 Main St, Anytown, AT 12345",
        doNumber: "DO987654",
        remainingDistance: 150,
        expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 12),
    },
    {
        id: "2",
        number: "EWB0987654321",
        carrierName: "SpeedyShip",
        customerName: "TechInnovate Inc",
        customerAddress: "456 Tech Blvd, Silicon Valley, CA 94000",
        doNumber: "DO123456",
        remainingDistance: 75,
        expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 18),
    },
    {
        id: "3",
        number: "EWB5678901234",
        carrierName: "Global Transit",
        customerName: "EcoGreen Solutions",
        customerAddress: "789 Sustainable Way, Greenville, GV 56789",
        doNumber: "DO246810",
        remainingDistance: 200,
        expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 6),
    },
]

