'use client'

import { useState } from 'react'
import styles from './EWayBillDashboard.module.css'
import { ChevronDown, ArrowUpDown } from './EWayBillDashboardIcons'

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

const mockEwaybills: Ewaybill[] = [
    {
        id: "1",
        number: "EWB1234567890",
        carrierName: "FastTrack Logistics",
        customerName: "Acme Corp",
        customerAddress: "123 Main St, Anytown, AT 12345",
        doNumber: "DO987654",
        remainingDistance: 150,
        expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 12), // 12 hours from now
    },
    {
        id: "2",
        number: "EWB0987654321",
        carrierName: "SpeedyShip",
        customerName: "TechInnovate Inc",
        customerAddress: "456 Tech Blvd, Silicon Valley, CA 94000",
        doNumber: "DO123456",
        remainingDistance: 75,
        expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 18), // 18 hours from now
    },
    {
        id: "3",
        number: "EWB5678901234",
        carrierName: "Global Transit",
        customerName: "EcoGreen Solutions",
        customerAddress: "789 Sustainable Way, Greenville, GV 56789",
        doNumber: "DO246810",
        remainingDistance: 200,
        expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 6), // 6 hours from now
    },
]

export default function EwaybillDashboard() {
    const [ewaybills, setEwaybills] = useState<Ewaybill[]>(mockEwaybills)
    const [searchTerm, setSearchTerm] = useState("")
    const [sortConfig, setSortConfig] = useState<{ key: keyof Ewaybill; direction: 'asc' | 'desc' } | null>(null)
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)

    // Filter ewaybills
    const filteredEwaybills = ewaybills.filter(ewaybill =>
        ewaybill.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ewaybill.carrierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ewaybill.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Sort ewaybills
    const sortedEwaybills = [...filteredEwaybills].sort((a, b) => {
        if (!sortConfig) return 0
        const { key, direction } = sortConfig
        if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
        if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
        return 0
    })

    const handleSort = (key: keyof Ewaybill) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig?.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const toggleDropdown = (id: string) => {
        setOpenDropdown(openDropdown === id ? null : id)
    }

    return (
        <div className={styles.EwaybillDashboardContainer}>
            <div className={styles.EwaybillDashboardcard}>
                <div className={styles.EwaybillDashboardcontent}>
                    <div className={styles.EwaybillDashboardtoolbar}>
                        <input
                            type="text"
                            placeholder="Search e-waybills..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.EwaybillDashboardsearchInput}
                        />
                        <div className={styles.EwaybillDashboardcount}>
                            Displaying {sortedEwaybills.length} e-waybills
                        </div>
                    </div>
                    <div className={styles.EwaybillDashboardtableContainer}>
                        <table className={styles.EwaybillDashboardtable}>
                            <thead>
                                <tr>
                                    <th>
                                        <button onClick={() => handleSort('number')} className={styles.EwaybillDashboardsortButton}>
                                            E-waybill Number
                                            <ArrowUpDown />
                                        </button>
                                    </th>
                                    <th>
                                        <button onClick={() => handleSort('carrierName')} className={styles.EwaybillDashboardsortButton}>
                                            Carrier Name
                                            <ArrowUpDown />
                                        </button>
                                    </th>
                                    <th>Customer Details</th>
                                    <th>DO Number</th>
                                    <th style={{
                                            textAlign: 'center',
                                        }}>
                                        <button onClick={() => handleSort('remainingDistance')} className={styles.EwaybillDashboardsortButton}>
                                            Remaining Distance (km)
                                            <ArrowUpDown />
                                        </button>
                                    </th>
                                    <th>
                                        <button onClick={() => handleSort('expiryTime')} className={styles.EwaybillDashboardsortButton}>
                                            Expiry Time
                                            <ArrowUpDown />
                                        </button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={styles.EwaybillDashboardtbody}>
                                {sortedEwaybills.map((ewaybill) => (
                                    <tr key={ewaybill.id}>
                                        <td>{ewaybill.number}</td>
                                        <td>{ewaybill.carrierName}</td>
                                        <td>
                                            <div className={styles.EwaybillDashboardDropdown}>
                                                <button
                                                    className={styles.EwaybillDashboardDropdownTrigger}
                                                    onClick={() => toggleDropdown(ewaybill.id)}
                                                >
                                                    {ewaybill.customerName}
                                                    <ChevronDown />
                                                </button>
                                                {openDropdown === ewaybill.id && (
                                                    <div className={styles.EwaybillDashboardDropdownContent}>
                                                        <div className={styles.EwaybillDashboardDropdownLabel}>Customer Details</div>
                                                        <div className={styles.EwaybillDashboardDropdownDivider} />
                                                        <div className={styles.EwaybillDashboardDropdownItem}>{ewaybill.customerName}</div>
                                                        <div className={styles.EwaybillDashboardDropdownItem}>{ewaybill.customerAddress}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>{ewaybill.doNumber}</td>
                                        <td style={{
                                            textAlign: 'center',
                                        }}>{ewaybill.remainingDistance}</td>
                                        <td>
                                            {ewaybill.expiryTime.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

