"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs"
import styles from "./PTPKDashboard.module.css"
import React from "react"
import dayjs from "dayjs"
import MetricCard from "../UI/MetricCard"
import FilterBar from "./FilterBar/FilterBar";
import DataOverviewTab from "./tabs/DataOverviewTab"
import {MultiSelectDropdown} from "./MultiSelectDropdown/MultiSelectDropdown";
import { httpsPost } from "@/utils/Communication";
import { toTitleCase } from "@/utils/stringUtils";
import AdvancedFiltersPanel from "./AdvancedFiltersPanel/AdvancedFiltersPanel";
import { iconMap } from "../UI/iconMap";
import SummaryCardSkeleton from "../UI/MetricCardSkeleton";


interface FilterOption {
  id: string
  label: string
  selected: boolean
}

interface MetricCardData {
  id: string;
  title: string;
  value: string;
  icon: React.ReactNode;
  cardClass: string;
  titleClass: string;
  valueClass: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
}

export default function PTPKDashboard() {
  const [selectedMode, setSelectedMode] = useState("All")
  const [selectedRegion, setSelectedRegion] = useState("All")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [selectedDateFilter, setSelectedDateFilter] = useState("MTD");
  const [fromDate, setFromDate] = useState("2025-07-20");
  const [toDate, setToDate] = useState("2025-07-22");

  const [zoneOptions, setZoneOptions] = useState<FilterOption[]>([]);
  const [stateOptions, setStateOptions] = useState<FilterOption[]>([]);
  const [materialOptions, setMaterialOptions] = useState<FilterOption[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [metricsData, setMetricsData] = useState<MetricCardData[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

  const [tableData, setTableData] = useState<any[]>([]);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [activeTab, setActiveTab] = useState("data");

  useEffect(() => {
    if (activeTab === "data") {
      fetchMetricsData();
      fetchTableData();
    }
  }, [filters, activeTab]);

  const fetchDropdownData = async (zoneFilter?: string | string[]) => {
    try {
      setIsLoading(true);

      let zonesArray: string[] | undefined;
      if (Array.isArray(zoneFilter)) {
        zonesArray = zoneFilter.map(z => z.toUpperCase());
      } else if (zoneFilter) {
        zonesArray = [zoneFilter.toUpperCase()];
      }

      const payload = zonesArray ? { zones: zonesArray } : {};

      const response = await httpsPost('ptpk/dropdowns', payload, {}, 1);

      if (response && response.data) {
        const { zones = [], states = [], materials = [] } = response.data;

        if (!zoneFilter) {
          setZoneOptions(
            zones.map((zone: string) => ({
              id: zone,
              label: toTitleCase(zone),
              selected: false
            }))
          );

          setMaterialOptions(
            materials.map((material: string) => ({
              id: material,
              label: material,
              selected: false
            }))
          );
        }

        setStateOptions(
          states.map((state: string) => ({
            id: state,
            label: toTitleCase(state),
            selected: false
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      if (!zoneFilter) {
        setZoneOptions([]);
        setMaterialOptions([]);
      }
      setStateOptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const handleZoneChange = (newZoneOptions: FilterOption[]) => {
    setZoneOptions(newZoneOptions);
    
    const selectedZone = newZoneOptions.find(opt => opt.selected);
    if (selectedZone) {
      setStateOptions(prev => 
        prev.map(opt => ({ ...opt, selected: false }))
      );
      fetchDropdownData(selectedZone.label);
    } else {
      fetchDropdownData();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"))
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const applyFilters = () => {
    const selectedZones = zoneOptions.filter(opt => opt.selected).map(opt => opt.label);
    const selectedStates = stateOptions.filter(opt => opt.selected).map(opt => opt.label);
    const selectedMaterials = materialOptions.filter(opt => opt.selected).map(opt => opt.label);

    const dateFrom = new Date().toISOString();
    const dateTo = new Date().toISOString();

    const payload = {
      dateFrom,
      dateTo,
      zones: selectedZones,
      states: selectedStates,
      materials: selectedMaterials,
    };

    setFilters(payload);
    setIsFilterOpen(false);
  };

  const fetchMetricsData = useCallback(async () => {
    setIsLoadingMetrics(true);
    try {
      const response = await httpsPost('ptpk/kpis', filters, {}, 1);
      if (response.statusCode === 200 && response.data) {
        setMetricsData(response.data);
      } else {
        setMetricsData([]);
        console.error("Failed to fetch metrics data:", response.msg);
      }
    } catch (error) {
      setMetricsData([]);
      console.error("Error fetching metrics data:", error);
    } finally {
      setIsLoadingMetrics(false);
    }
  }, [filters]);

  useEffect(() => {
    const payload = {
      period: "MTD",
      startDate: dayjs().startOf("month"),
      endDate: dayjs(),
    }
    setFilters(payload);
    fetchMetricsData();
  }, []);
  
  
  const fetchTableData = useCallback(async () => {
    setIsLoadingTable(true);
    try {
      const response = await httpsPost('ptpk/table', filters, {}, 1);
      if (response.statusCode === 200 && response.data) {
        setTableData(response.data.modes); 
      } else {
        setTableData([]);
        console.error("Failed to fetch table data:", response.msg);
      }
    } catch (error) {
      setTableData([]);
      console.error("Error fetching table data:", error);
    } finally {
      setIsLoadingTable(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTableData();
  }, []);

  return (
    <div className={styles.dashboardContainer}>
        
      <div className={`${styles.mainContent} ${isFilterOpen ? styles.bodyNoScroll : ''}`}>
        <div className={styles.contentSpacing}>
          <Tabs defaultValue="data" className={styles.contentSpacing}>
            <div className={styles.stickyTabs}>
              <div className={styles.tabsHeader}>
                <TabsList className={styles.tabsList}>
                  <TabsTrigger value="data" className={styles.tabsTrigger} style={{width: "400%"}}>
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
                  onApplyFilters={(appliedFilters) => setFilters(appliedFilters)}
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
            />
            )}

            <div className={styles.metricsGrid}>
              {isLoadingMetrics ? (
                <SummaryCardSkeleton count={4} />
              ) : metricsData.length === 0 ? (
                <div className={styles.noDataAvailable}>No data available for the selected period.</div>
              ) : (
                metricsData.map((metric) => {
                  const formatIconName = (name: string) => {
                    if (!name) return 'default';
                    return name
                      .split(/[-_]/)
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join('');
                  };
                
                  const iconName = formatIconName(metric.icon as string);
                  const IconComponent = iconMap[iconName] || iconMap.default;

                  return (
                    <MetricCard
                      key={metric.id}
                      title={metric.title}
                      value={metric.value}
                      icon={<IconComponent className="h-4 w-4" style={{ color: metric.iconColor }} />}
                      bgColor={metric.bgColor}
                      borderColor={metric.borderColor}
                      iconColor={metric.iconColor}
                    />
                  );
                })
              )}
            </div>
            
            <DataOverviewTab  tableData={tableData} isLoadingTable={isLoadingTable} filters={filters}/>
           
          </Tabs>
        </div>
      </div>
    </div>
  )
}