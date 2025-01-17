"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ReloadOutlined,
  DownloadOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { Button, Card, DatePicker, Select, Space, Tag } from "antd";
import { useRouter } from "next/navigation";
import Header from "@/components/Header/header";
import SideDrawer from "@/components/Drawer/Drawer";
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import MobileHeader from "@/components/Header/mobileHeader";
import { useMediaQuery, useTheme } from "@mui/material";
import { httpsPost } from "@/utils/Communication";
import { jsontocsv } from "@/utils/jsonToCsv";
import { LineChart } from "@/components/Charts/LineChart";
import dayjs from "dayjs";
import "./page.css";

const { RangePicker } = DatePicker;

export default function DispatchTrend() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(new Date().setDate(new Date().getDate() - 7)),
    new Date(),
  ]);
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [carrierOptions, setCarrierOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [cityOptions, setCityOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [customerOptions, setCustomerOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [materialOptions, setMaterialOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<any>(null);
  const [downloadData, setDownloadData] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadChartData = useCallback(async () => {
    if (!dateRange[0] || !dateRange[1]) {
      console.error("Date range is incomplete.");
      return; // Exit early if dateRange is invalid
    }
  
    setIsLoading(true);
    try {
      const payload = {
        from_date: dateRange[0].toISOString(),
        to_date: dateRange[1].toISOString(),
        ...(selectedCarriers.length && {
          search_transporter: selectedCarriers,
        }),
        ...(selectedCities.length && { search_cities: selectedCities }),
        ...(selectedCustomers.length && { search_customer: selectedCustomers }),
        ...(selectedMaterials.length && {
          search_materials: selectedMaterials,
        }),
      };
  
      const response = await httpsPost(
        "stats/dispatch/time_series",
        payload,
        router,
        1
      );
  
      if (response?.statusCode === 200) {
        const sortedData = response.data.map((obj: any) => ({
          name: obj.material,
          res: obj.res.sort(
            (a: any, b: any) => Date.parse(a.date) - Date.parse(b.date)
          ),
        }));
  
        // Update options for filters
        const options = sortedData.reduce(
          (acc: any, { res }: any) => {
            res.forEach(
              ({
                material_names,
                carrier_names,
                customer_names,
                city_names,
              }: any) => {
                acc.material_names = [
                  ...new Set([...acc.material_names, ...material_names]),
                ];
                acc.carrier_names = [
                  ...new Set([...acc.carrier_names, ...carrier_names]),
                ];
                acc.customer_names = [
                  ...new Set([...acc.customer_names, ...customer_names]),
                ];
                acc.city_names = [
                  ...new Set([...acc.city_names, ...city_names]),
                ];
              }
            );
            return acc;
          },
          {
            material_names: [],
            carrier_names: [],
            customer_names: [],
            city_names: [],
          }
        );
  
        setCarrierOptions(
          options.carrier_names.map((name: string) => ({
            value: name,
            label: name,
          }))
        );
        setCityOptions(
          options.city_names.map((name: string) => ({
            value: name,
            label: name,
          }))
        );
        setCustomerOptions(
          options.customer_names.map((name: string) => ({
            value: name,
            label: name,
          }))
        );
        setMaterialOptions(
          options.material_names.map((name: string) => ({
            value: name,
            label: name,
          }))
        );
  
        setChartData(sortedData);
  
        // Prepare download data
        const downloadData = sortedData.map((series: any) => ({
          name: Array.isArray(series.name)
            ? series.name.join(", ")
            : series.name,
          ...series.res.reduce((acc: any, point: any) => {
            acc[new Date(point.date).toLocaleDateString()] = point.total_weight;
            return acc;
          }, {}),
        }));
  
        setDownloadData(downloadData);
      }
    } catch (error) {
      console.error("Error loading chart data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    dateRange,
    selectedCarriers,
    selectedCities,
    selectedCustomers,
    selectedMaterials,
    router,
  ]);
  

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await httpsPost("/api/v1/dispatch-trend/filters", {});
        if (response?.success) {
          const data = response.data;
          setCarrierOptions(
            data.carriers.map((c: string) => ({ value: c, label: c }))
          );
          setCityOptions(
            data.cities.map((c: string) => ({ value: c, label: c }))
          );
          setCustomerOptions(
            data.customers.map((c: string) => ({ value: c, label: c }))
          );
          // Make material names unique
          const uniqueMaterials = Array.from(
            new Set(data.materials as string[])
          ).sort();
          setMaterialOptions(
            uniqueMaterials.map((m) => ({ value: m, label: m }))
          );
        }
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  const handleDownload = () => {
    if (downloadData) {
      jsontocsv(
        downloadData,
        `dispatchTrendChartData${new Date().toLocaleString()}`,
        [
          "name",
          ...Object.keys(downloadData[0]).filter((key) => key !== "name"),
        ]
      );
    }
  };

  const mainContent = (
    <div className="content-wrapper">
      <Card className="chart-container" bordered={false}>
        <div className="action-buttons">
          <Space size="small">
            <Button
              icon={<ReloadOutlined spin={isLoading} />}
              onClick={loadChartData}
              loading={isLoading}
              size="middle"
            >
              Refresh
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              disabled={!downloadData}
              size="middle"
            >
              Download
            </Button>
          </Space>
        </div>

        <div className="filters-section">
          <div className="filters-grid">
            <RangePicker
              value={
                dateRange.map((date) => (date ? dayjs(date) : null)) as [
                  dayjs.Dayjs,
                  dayjs.Dayjs
                ]
              }
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setDateRange([dates[0].toDate(), dates[1].toDate()]);
                } else {
                  setDateRange([null, null]); // Handle cleared state
                }
              }}    
              className="w-full"
              suffixIcon={<CalendarOutlined />}
              popupClassName="date-picker-popup"
              getPopupContainer={(trigger) => trigger.parentElement!}
              size="middle"
            />
            <Select
              mode="multiple"
              placeholder="Select Carriers"
              value={selectedCarriers}
              onChange={setSelectedCarriers}
              options={carrierOptions}
              className="w-full"
              popupClassName="select-popup"
              dropdownMatchSelectWidth={false}
              maxTagCount="responsive"
              getPopupContainer={(trigger) => trigger.parentElement!}
              size="middle"
            />
            <Select
              mode="multiple"
              placeholder="Select Cities"
              value={selectedCities}
              onChange={setSelectedCities}
              options={cityOptions}
              className="w-full"
              popupClassName="select-popup"
              dropdownMatchSelectWidth={false}
              maxTagCount="responsive"
              getPopupContainer={(trigger) => trigger.parentElement!}
              size="middle"
            />
            <Select
              mode="multiple"
              placeholder="Select Customers"
              value={selectedCustomers}
              onChange={setSelectedCustomers}
              options={customerOptions}
              className="w-full"
              popupClassName="select-popup"
              dropdownMatchSelectWidth={false}
              maxTagCount="responsive"
              getPopupContainer={(trigger) => trigger.parentElement!}
              size="middle"
            />
            <Select
              mode="multiple"
              placeholder="Select Materials"
              value={selectedMaterials}
              onChange={setSelectedMaterials}
              options={materialOptions}
              className="w-full"
              popupClassName="select-popup"
              dropdownMatchSelectWidth={false}
              maxTagCount="responsive"
              getPopupContainer={(trigger) => trigger.parentElement!}
              size="middle"
            />
          </div>

          {/* Active Filters */}
          {(selectedCarriers.length > 0 ||
            selectedCities.length > 0 ||
            selectedCustomers.length > 0 ||
            selectedMaterials.length > 0) && (
            <div className="flex flex-wrap gap-1 mb-3">
              {selectedCarriers.map((carrier) => (
                <Tag
                  key={carrier}
                  closable
                  onClose={() =>
                    setSelectedCarriers((prev) =>
                      prev.filter((c) => c !== carrier)
                    )
                  }
                  color="blue"
                >
                  {carrier}
                </Tag>
              ))}
              {selectedCities.map((city) => (
                <Tag
                  key={city}
                  closable
                  onClose={() =>
                    setSelectedCities((prev) => prev.filter((c) => c !== city))
                  }
                  color="green"
                >
                  {city}
                </Tag>
              ))}
              {selectedCustomers.map((customer) => (
                <Tag
                  key={customer}
                  closable
                  onClose={() =>
                    setSelectedCustomers((prev) =>
                      prev.filter((c) => c !== customer)
                    )
                  }
                  color="purple"
                >
                  {customer}
                </Tag>
              ))}
              {selectedMaterials.map((material) => (
                <Tag
                  key={material}
                  closable
                  onClose={() =>
                    setSelectedMaterials((prev) =>
                      prev.filter((m) => m !== material)
                    )
                  }
                  color="orange"
                >
                  {material}
                </Tag>
              ))}
            </div>
          )}
        </div>

        <div className="chart-section">
          {chartData ? (
            <LineChart data={chartData} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500">No data available</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="relative">
      {!isMobile ? <Header /> : <MobileHeader />}
      <div className="dashboard-container">
        {!isMobile && (
          <div className="drawer-wrapper">
            <SideDrawer />
          </div>
        )}
        <div className="main-content">{mainContent}</div>
      </div>
      {isMobile && <MobileDrawer />}
    </div>
  );
}
