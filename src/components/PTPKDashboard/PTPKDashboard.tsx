"use client"

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/UI/tabs"
import styles from "./PTPKDashboard.module.css"
import type React from "react"
import FilterBar from "./FilterBar/FilterBar"
import DataOverviewTab from "./tabs/DataOverviewTab"
import { httpsPost } from "@/utils/Communication"
import { toTitleCase } from "@/utils/stringUtils"
import AdvancedFiltersPanel from "./AdvancedFiltersPanel/AdvancedFiltersPanel"
import dayjs from "dayjs"

interface FilterOption {
  id: string
  label: string
  selected: boolean
}

interface MetricCardData {
  id: string
  title: string
  value: string
  icon: React.ReactNode
  cardClass: string
  titleClass: string
  valueClass: string
  iconColor: string
  bgColor: string
  borderColor: string
}

export default function PTPKDashboard() {
  const [selectedMode, setSelectedMode] = useState("All")
  const [selectedRegion, setSelectedRegion] = useState("All")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [selectedDateFilter, setSelectedDateFilter] = useState("MTD")
  const [fromDate, setFromDate] = useState(dayjs().startOf("month").format("YYYY-MM-DD"))
  const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"))

  const [zoneOptions, setZoneOptions] = useState<FilterOption[]>([])
  const [stateOptions, setStateOptions] = useState<FilterOption[]>([])
  const [materialOptions, setMaterialOptions] = useState<FilterOption[]>([])
  const [selectedZones, setSelectedZones] = useState<string[]>([])
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [metricsData, setMetricsData] = useState<MetricCardData[]>([])
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false)

  const [tableData, setTableData] = useState<any[]>([])
  const [isLoadingTable, setIsLoadingTable] = useState(false)
  const [filters, setFilters] = useState<any>({})
  const [filtersDate, setDateFilters] = useState<any>({})
  const [activeTab, setActiveTab] = useState("data")
  const [hasAdvancedFilters, setHasAdvancedFilters] = useState(false)

  const [distanceFrom, setDistanceFrom] = useState<string>("")
  const [distanceTo, setDistanceTo] = useState<string>("")
  const [dateType, setDateType] = useState<'approve' | 'gateout'>('approve');

  useEffect(() => {
    if (activeTab === "data") {
      fetchMetricsData()
    }
  }, [filters, activeTab])

  useEffect(() => {
    const isAnyAdvancedFilterActive =
      (filters.zones && filters.zones.length > 0) ||
      (filters.states && filters.states.length > 0) ||
      (filters.materials && filters.materials.length > 0) ||
      (filters.gt_dist !== undefined && filters.gt_dist !== "") ||
      (filters.lt_dist !== undefined && filters.lt_dist !== "")

    setHasAdvancedFilters(isAnyAdvancedFilterActive)
  }, [filters])

  const fetchDropdownData = async (zoneFilter?: string | string[]) => {
    try {
      setIsLoading(true)

      let zonesArray: string[] = []
      if (Array.isArray(zoneFilter)) {
        zonesArray = zoneFilter.map((zone) =>
          typeof zone === "string" ? zone.toUpperCase() : String(zone).toUpperCase(),
        )
      } else if (zoneFilter) {
        zonesArray = [String(zoneFilter).toUpperCase()]
      }

      const payload = { zones: zonesArray }
      const response = await httpsPost("ptpk/dropdowns", payload, {}, 1)

      if (response?.data) {
        const { zones = [], states = [], materials = [] } = response.data

        if (!zoneFilter || (Array.isArray(zoneFilter) && zoneFilter.length === 0)) {
          setZoneOptions(zones.map((zone: any) => ({ id: zone, label: toTitleCase(zone), selected: false })))
        }

        setMaterialOptions(
          materials.map((material: any) => ({
            id: material,
            label: material,
            selected: materialOptions.some((opt) => opt.label === material && opt.selected),
          })),
        )

        setStateOptions(
          states.map((state: any) => ({
            id: state,
            label: toTitleCase(state),
            selected: stateOptions.some((opt) => opt.label === toTitleCase(state) && opt.selected),
          })),
        )
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error)
      if (!zoneFilter) {
        setZoneOptions([])
        setMaterialOptions([])
      }
      setStateOptions([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDropdownData()
  }, [])

  const handleZoneChange = (newZoneOptions: FilterOption[]) => {
    setZoneOptions(newZoneOptions)

    const selectedZonesArray = newZoneOptions.filter((opt) => opt.selected).map((opt) => opt.id)
    setStateOptions((prev) => prev.map((opt) => ({ ...opt, selected: false })))
    fetchDropdownData(selectedZonesArray.length > 0 ? selectedZonesArray : undefined)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"))
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const applyFilters = () => {
    const selectedZones = zoneOptions.filter((opt) => opt.selected).map((opt) => opt.id)
    const selectedStates = stateOptions.filter((opt) => opt.selected).map((opt) => opt.label)
    const selectedMaterials = materialOptions.filter((opt) => opt.selected).map((opt) => opt.label)

    const startDate = fromDate ? fromDate : dayjs().startOf("month").toISOString()
    const endDate = toDate ? toDate : dayjs().toISOString()

    const payload: any = {
      period: selectedDateFilter,
      startDate,
      endDate,
    }

    if (selectedZones.length > 0) payload.zones = selectedZones
    if (selectedStates.length > 0) payload.states = selectedStates
    if (selectedMaterials.length > 0) payload.materials = selectedMaterials

    if (distanceFrom.trim() !== "") payload.gt_dist = Number(distanceFrom)
    if (distanceTo.trim() !== "") payload.lt_dist = Number(distanceTo)

    setFilters(payload)
    setIsFilterOpen(false)
  }

  const applyFiltersFromBar = (payload: any) => {
    const selectedZones = zoneOptions.filter((opt) => opt.selected).map((opt) => opt.id)
    const selectedStates = stateOptions.filter((opt) => opt.selected).map((opt) => opt.label)
    const selectedMaterials = materialOptions.filter((opt) => opt.selected).map((opt) => opt.label)

    if (selectedZones.length > 0) payload.zones = selectedZones
    if (selectedStates.length > 0) payload.states = selectedStates
    if (selectedMaterials.length > 0) payload.materials = selectedMaterials

    if (distanceFrom.trim() !== "") payload.gt_dist = Number(distanceFrom)
    if (distanceTo.trim() !== "") payload.lt_dist = Number(distanceTo)
    setFromDate(payload.startDate)
    setToDate(payload.endDate)
    setSelectedDateFilter(payload.period)
    setFilters(payload)
    setIsFilterOpen(false)
    setDateType(payload.dateType)
  }

  const fetchMetricsData = useCallback(async () => {
    setIsLoadingMetrics(true)
    try {
      const { dateType, ...filtersForKpis } = filters;
      const response = await httpsPost("ptpk/kpis", filtersForKpis, {}, 1);
      if (response.statusCode === 200 && response.data) {
        setMetricsData(response.data)
      } else {
        setMetricsData([])
        console.error("Failed to fetch metrics data:", response.msg)
      }
    } catch (error) {
      setMetricsData([])
      console.error("Error fetching metrics data:", error)
    } finally {
      setIsLoadingMetrics(false)
    }
  }, [filters])

  useEffect(() => {
    const payload = {
      period: "MTD",
      startDate: dayjs().startOf("month").toISOString(),
      endDate: dayjs().toISOString(),
    }
    setFromDate(dayjs().startOf("month").format("YYYY-MM-DD"))
    setToDate(dayjs().format("YYYY-MM-DD"))
    setFilters(payload)
  }, [])

  const fetchTableData = useCallback(async () => {
    setIsLoadingTable(true)
    try {
      const response = await httpsPost("ptpk/table", {
        ...filters,
        dateType,
      }, {}, 1)
      if (response.statusCode === 200 && response.data) {
        setTableData(response.data.modes)
      } else {
        setTableData([])
        console.error("Failed to fetch table data:", response.msg)
      }
    } catch (error) {
      setTableData([])
      console.error("Error fetching table data:", error)
    } finally {
      setIsLoadingTable(false)
    }
  }, [filters, dateType])

  useEffect(() => {
    if (activeTab === "data") {
      fetchTableData();
    }
  }, [dateType, activeTab, fetchTableData]);

  const resetFilterSelections = () => {
    setZoneOptions((prev) => prev.map((opt) => ({ ...opt, selected: false })))
    setStateOptions((prev) => prev.map((opt) => ({ ...opt, selected: false })))
    setMaterialOptions((prev) => prev.map((opt) => ({ ...opt, selected: false })))

    setDistanceFrom("")
    setDistanceTo("")
  
    const resetPayload = {
      period: "MTD",
      startDate: dayjs().startOf("month").toISOString(),
      endDate: dayjs().toISOString(),
    }
    setFromDate(dayjs().startOf("month").format("YYYY-MM-DD"))
    setToDate(dayjs().format("YYYY-MM-DD"))
    setSelectedDateFilter("MTD")
    setFilters(resetPayload)
    setIsFilterOpen(false)
    setDateType('approve')
  }

  // New function to clear ONLY advanced filters, keeping the date range
  const clearAdvancedFilters = () => {
    // Reset advanced filter state
    setZoneOptions((prev) => prev.map((opt) => ({ ...opt, selected: false })))
    setStateOptions((prev) => prev.map((opt) => ({ ...opt, selected: false })))
    setMaterialOptions((prev) => prev.map((opt) => ({ ...opt, selected: false })))
    setDistanceFrom("")
    setDistanceTo("")
    
    // Create new payload with advanced filters cleared, but date filters kept
    const payload = {
      period: selectedDateFilter,
      startDate: dayjs(fromDate).toISOString(),
      endDate: dayjs(toDate).toISOString(),
    }
    
    setFilters(payload)
    setIsFilterOpen(false)
  }

  const handleDateTypeChange = (newDateType: 'approve' | 'gateout') => {
    setDateType(newDateType);
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={`${styles.mainContent} ${isFilterOpen ? styles.bodyNoScroll : ""}`}>
        <div className={styles.contentSpacing}>
          <Tabs defaultValue="data" className={styles.contentSpacing}>
            <div className={styles.stickyTabs}>
              <div className={styles.tabsHeader}>
                <TabsList className={styles.tabsList}>
                  <TabsTrigger value="data" className={styles.tabsTrigger} style={{ width: "400%" }}>
                    📊 Data Overview
                  </TabsTrigger>
                  {/* <TabsTrigger value="analysis" className={styles.tabsTrigger}>
                    📈 Visual Analysis
                  </TabsTrigger>
                  <TabsTrigger value="trends" className={styles.tabsTrigger}>
                    📉 Seasonal Trends
                  </TabsTrigger>
                  <TabsTrigger value="actions" className={styles.tabsTrigger}>
                    🎯 Action Plan
                  </TabsTrigger> */}
                </TabsList>
                <FilterBar
                  onFilterClick={() => setIsFilterOpen(true)}
                  onApplyFilters={(appliedFilters) => applyFiltersFromBar(appliedFilters)}
                  resetAllFilters={resetFilterSelections} // This button clears everything
                  hasActiveFilters={hasAdvancedFilters}
                />
              </div>
            </div>

            {isFilterOpen && (
              <AdvancedFiltersPanel
                isOpen={isFilterOpen}
                setIsFilterOpen={setIsFilterOpen}
                zoneOptions={zoneOptions}
                stateOptions={stateOptions}
                materialOptions={materialOptions}
                handleZoneChange={handleZoneChange}
                setStateOptions={setStateOptions}
                setMaterialOptions={setMaterialOptions}
                applyFilters={applyFilters}
                distanceFrom={distanceFrom}
                distanceTo={distanceTo}
                setDistanceFrom={setDistanceFrom}
                setDistanceTo={setDistanceTo}
                resetFilters={clearAdvancedFilters} // This button now only clears advanced filters
              />
            )}

            <DataOverviewTab
              tableData={tableData}
              isLoadingTable={isLoadingTable}
              filters={filters}
              metricsData={metricsData}
              isLoadingMetrics={isLoadingMetrics}
              dateType={dateType}
              onDateTypeChange={handleDateTypeChange}
              
            />
          </Tabs>
        </div>
      </div>
    </div>
  )
}
