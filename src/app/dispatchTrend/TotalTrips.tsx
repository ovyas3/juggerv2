'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Select, DatePicker, Button, Tag, Space, AutoComplete } from 'antd';
import { ReloadOutlined, DownloadOutlined, ArrowLeftOutlined, CalendarOutlined, SortAscendingOutlined, SortDescendingOutlined, ClearOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { httpsPost } from '@/utils/Communication';
import { useRouter } from 'next/navigation';
import { jsontocsv } from '@/utils/jsonToCsv';
import ReactECharts from 'echarts-for-react';
import { debounce, throttle } from 'lodash';

// Styled Components
const StyledContainer = styled.div`
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0px 16px 32px rgba(233, 238, 242, 0.4);
  padding: 24px;
  margin-top: 12px;
`;

const TopHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;

  .title {
    font-weight: 600;
    font-size: 16px;
    color: #333333;
    font-family: "Plus Jakarta Sans", sans-serif;
  }

  .actions {
    display: flex;
    gap: 16px;
    align-items: center;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  margin-top: 28px;
  flex-wrap: wrap;

  .ant-picker, .ant-select, .ant-input {
    min-width: 200px;
    border-radius: 8px;
    
    &:hover, &:focus {
      border-color: #2962ff;
    }
  }
`;

const ChipsSection = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 0;

  .chip-group {
    display: flex;
    align-items: center;
    padding: 8px 0;

    .label {
      font-size: 12px;
      font-weight: 600;
      color: #666666;
      margin-right: 8px;
    }

    .ant-tag {
      margin: 4px;
      padding: 4px 8px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      
      &.blue {
        color: #2962ff;
        background: #e5ecff;
        border-color: #e5ecff;
      }
      
      &.green {
        color: #00c853;
        background: #e8f5e9;
        border-color: #e8f5e9;
      }
      
      &.purple {
        color: #6200ea;
        background: #f3e5f5;
        border-color: #f3e5f5;
      }
      
      &.orange {
        color: #ff6d00;
        background: #fff3e0;
        border-color: #fff3e0;
      }
    }
  }
`;

const TopResults = styled.div`
  font-size: 14px;
  color: #666666;
  margin: 16px 0;
`;

const ChartContainer = styled.div`
  height: 390px;
  margin-top: 20px;
`;

// State interfaces
interface ChartData {
  tooltip: any;
  grid: any;
  xAxis: any;
  yAxis: any;
  series: any[];
}

export default function TotalTrips() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    dayjs().subtract(1, 'week').toDate(),
    dayjs().toDate()
  ]);
  const [hierarchy, setHierarchy] = useState<string[]>([]);
  const [changed, setChanged] = useState(true);
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [carrierOptions, setCarrierOptions] = useState<{ value: string; label: string }[]>([]);
  const [cityOptions, setCityOptions] = useState<{ value: string; label: string }[]>([]);
  const [customerOptions, setCustomerOptions] = useState<{ value: string; label: string }[]>([]);
  const [materialOptions, setMaterialOptions] = useState<{ value: string; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [downloadData, setDownloadData] = useState<any>(null);
  const [sortType, setSortType] = useState<'asc' | 'desc' | null>(null);
  const [filterOption, setFilterOption] = useState('ZONE');
  const [shouldRefetch, setShouldRefetch] = useState(false);
  const [carrierInput, setCarrierInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [customerInput, setCustomerInput] = useState('');
  const [materialInput, setMaterialInput] = useState('');

  const loadBarGraph = useCallback(async (type = 'filter') => {
    if (!dateRange[0] || !dateRange[1]) return;

    if (type === 'filter') {
      setChanged(true);
      if (filterOption === 'ZONE') {
        setHierarchy([]);
      }
      if (filterOption === 'STATE') {
        setHierarchy(['No Zone Selected']);
        hierarchy.splice(1);
      }
    } else {
      setChanged(false);
    }

    setIsLoading(true);
    try {
      const payload = {
        from_date: dayjs(dateRange[0]).startOf('day').toISOString(),
        to_date: dayjs(dateRange[1]).endOf('day').toISOString(),
        ...((type !== 'hierarchy' || hierarchy.length === 0) && { group_by: filterOption }),
        ...((hierarchy.length === 1 && type === 'hierarchy') && { filter_zone: [hierarchy[hierarchy.length - 1]] }),
        ...((hierarchy.length === 2 && type === 'hierarchy') && { filter_state: [hierarchy[hierarchy.length - 1]] }),
        ...((hierarchy.length === 3) && { filter_city: [hierarchy[hierarchy.length - 1]] }),
        ...(selectedCarriers.length > 0 && { search_transporter: selectedCarriers }),
        ...(selectedCities.length > 0 && { search_cities: selectedCities }),
        ...(selectedCustomers.length > 0 && { search_customer: selectedCustomers }),
        ...(selectedMaterials.length > 0 && { search_materials: selectedMaterials }),
      };

      const response = await httpsPost('stats/dispatch/barGraph', payload, router, 1);

      if (response?.statusCode === 200) {
        const data = response.data;

        if (!carrierOptions.length) {
          const carriers = [...new Set(data.map((e: any) => e.carrier_names).flat())] as string[];
          setCarrierOptions(carriers.map(c => ({ value: c, label: c })));
        }
        if (!cityOptions.length) {
          const cities = [...new Set(data.map((e: any) => e.city_names).flat())] as string[];
          setCityOptions(cities.map(c => ({ value: c, label: c })));
        }
        if (!customerOptions.length) {
          const customers = [...new Set(data.map((e: any) => e.customer_names).flat())] as string[];
          setCustomerOptions(customers.map(c => ({ value: c, label: c })));
        }
        if (!materialOptions.length) {
          const materials = [...new Set(data.map((e: any) => e.material_names.map((m: any) => m.join())).flat())] as string[];
          setMaterialOptions(materials.map(m => ({ value: m, label: m })));
        }

        let chartData = data.map((e: any) => ({
          name: filterOption === 'DISTANCE' ? Math.round(e._id / 1000).toString() : e._id,
          weight: Math.round(e.total_weight),
          trips: e.no_of_trips
        })).sort((a: { weight: number }, b: { weight: number }) => b.weight - a.weight).slice(0, 20);

        if (sortType === null) {
          chartData = chartData.sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));
        } else if (sortType === 'asc') {
          chartData = chartData.sort((a: { weight: number }, b: { weight: number }) => a.weight - b.weight);
        } else if (sortType === 'desc') {
          chartData = chartData.sort((a: { weight: number }, b: { weight: number }) => b.weight - a.weight);
        }

        const xLineData = chartData.map((e: { name: string }) => e.name);
        const series = chartData.map((e: { weight: number; trips: number }) => ({
          value: e.weight,
          trips: e.trips
        }));

        const chartOptions: ChartData = {
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function (params: any) {
              return `${params[0].axisValue}<br>Weight: ${params[0].data.value}(MT)<br>No of trips: ${params[0].data.trips}`;
            }
          },
          grid: {
            left: "6%",
            right: "2%",
          },
          xAxis: {
            type: 'category',
            data: xLineData,
            axisLabel: {
              interval: 0,
              rotate: 45,
              formatter: function (value: string) {
                return value.length > 7 ? value.slice(0, 7) + '...' : value;
              }
            },
            nameTruncate: {
              maxWidth: 10,
              ellipsis: '...'
            }
          },
          yAxis: [{
            type: 'value',
            name: 'MT',
            nameLocation: 'middle',
            nameGap: 50,
            splitLine: { show: false },
          }],
          series: [{
            data: series,
            type: 'bar',
            barWidth: 24,
            itemStyle: { color: '#74D8B9' },
          }]
        };

        setChartData(chartOptions);
        setDownloadData(xLineData.map((name: string, index: number) => ({
          name: name,
          value: series[index].value,
        })));
      }
    } catch (error) {
      console.error('Error loading bar graph:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, hierarchy, filterOption, selectedCarriers, selectedCities, selectedCustomers, selectedMaterials, sortType, carrierOptions, cityOptions, customerOptions, materialOptions]);

  const debouncedLoadBarGraph = useCallback(
    debounce(() => {
      setShouldRefetch(true);
    }, 500),
    []
  );

  useEffect(() => {
    if (shouldRefetch) {
      loadBarGraph();
      setShouldRefetch(false);
    }
  }, [shouldRefetch, loadBarGraph]);

  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      loadBarGraph();
    }
  }, []);

  const handleFilterUpdate = useCallback((filterType: string, value: string) => {
    switch (filterType) {
      case 'carrier':
        setSelectedCarriers(prev => [...prev, value]);
        break;
      case 'city':
        setSelectedCities(prev => [...prev, value]);
        break;
      case 'customer':
        setSelectedCustomers(prev => [...prev, value]);
        break;
      case 'material':
        setSelectedMaterials(prev => [...prev, value]);
        break;
    }
    debouncedLoadBarGraph();
  }, [debouncedLoadBarGraph]);

  const handleFilterRemove = useCallback((filterType: string, value: string) => {
    switch (filterType) {
      case 'carrier':
        setSelectedCarriers(prev => prev.filter(c => c !== value));
        break;
      case 'city':
        setSelectedCities(prev => prev.filter(c => c !== value));
        break;
      case 'customer':
        setSelectedCustomers(prev => prev.filter(c => c !== value));
        break;
      case 'material':
        setSelectedMaterials(prev => prev.filter(m => m !== value));
        break;
    }
    debouncedLoadBarGraph();
  }, [debouncedLoadBarGraph]);

  const handleDownload = () => {
    if (downloadData) {
      jsontocsv(
        downloadData,
        `totalTripsData_${dayjs().format('YYYY-MM-DD_HH-mm')}`,
        ['name', 'value']
      );
    }
  };

  return (
    <StyledContainer>
      <TopHeader>
        <div className="title">Total Dispatched Load</div>
        <div className="actions">
          {hierarchy.length > 0 && (
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => {
                hierarchy.pop();
                loadBarGraph('hierarchy');
              }}
            />
          )}
          <Space>
            {sortType === null && (
              <Button
                icon={<SortAscendingOutlined />}
                onClick={() => { setSortType('asc'); loadBarGraph(); }}
              />
            )}
            {sortType === 'asc' && (
              <Button
                icon={<SortDescendingOutlined />}
                onClick={() => { setSortType('desc'); loadBarGraph(); }}
              />
            )}
            {sortType !== null && (
              <Button
                icon={<ClearOutlined />}
                onClick={() => { setSortType(null); loadBarGraph(); }}
              />
            )}
          </Space>
          <Button
            icon={<ReloadOutlined spin={isLoading} />}
            onClick={() => loadBarGraph()}
          />
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            disabled={!downloadData}
          />
        </div>
      </TopHeader>

      <ChipsSection>
        {selectedCarriers.length > 0 && (
          <div className="chip-group">
            <span className="label">Carriers:</span>
            {selectedCarriers.map(carrier => (
              <Tag
                key={carrier}
                closable
                onClose={() => handleFilterRemove('carrier', carrier)}
                className="blue"
              >
                {carrier.slice(0, 10)}
              </Tag>
            ))}
          </div>
        )}
        {selectedCities.length > 0 && (
          <div className="chip-group">
            <span className="label">Cities:</span>
            {selectedCities.map(city => (
              <Tag
                key={city}
                closable
                onClose={() => handleFilterRemove('city', city)}
                className="green"
              >{city.slice(0, 10)}
              </Tag>
            ))}
          </div>
        )}
        {selectedCustomers.length > 0 && (
          <div className="chip-group">
            <span className="label">Customers:</span>
            {selectedCustomers.map(customer => (
              <Tag
                key={customer}
                closable
                onClose={() => handleFilterRemove('customer', customer)}
                className="purple"
              >
                {customer.slice(0, 10)}
              </Tag>
            ))}
          </div>
        )}
        {selectedMaterials.length > 0 && (
          <div className="chip-group">
            <span className="label">Materials:</span>
            {selectedMaterials.map(material => (
              <Tag
                key={material}
                closable
                onClose={() => handleFilterRemove('material', material)}
                className="orange"
              >
                {material.slice(0, 10)}
              </Tag>
            ))}
          </div>
        )}
      </ChipsSection>

      <FiltersContainer>
        <DatePicker.RangePicker
          value={[dateRange[0] ? dayjs(dateRange[0]) : null, dateRange[1] ? dayjs(dateRange[1]) : null]}
          onChange={(dates) => {
            if (dates) {
              setDateRange([dates[0]?.toDate() || null, dates[1]?.toDate() || null]);
              debouncedLoadBarGraph();
            }
          }}
          suffixIcon={<CalendarOutlined />}
        />
        <Select
          value={filterOption}
          onChange={(value) => {
            setFilterOption(value);
            debouncedLoadBarGraph();
          }}
          options={[
            { value: 'ZONE', label: 'Zone' },
            { value: 'STATE', label: 'State' },
            { value: 'CITY', label: 'City' },
            { value: 'CUSTOMER', label: 'Customer' },
            { value: 'TRANSPORTER', label: 'Transporter' }
          ]}
        />
        <AutoComplete
          value={carrierInput}
          options={carrierOptions}
          placeholder="Carrier"
          filterOption={(inputValue, option) =>
            option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
          }
          onSelect={(value) => {
            handleFilterUpdate('carrier', value);
            setCarrierInput('');
          }}
          onChange={(value) => setCarrierInput(value)}
        />
        <AutoComplete
          value={cityInput}
          options={cityOptions}
          placeholder="City"
          filterOption={(inputValue, option) =>
            option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
          }
          onSelect={(value) => {
            handleFilterUpdate('city', value);
            setCityInput('');
          }}
          onChange={(value) => setCityInput(value)}
        />
        <AutoComplete
          value={customerInput}
          options={customerOptions}
          placeholder="Customer"
          filterOption={(inputValue, option) =>
            option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
          }
          onSelect={(value) => {
            handleFilterUpdate('customer', value);
            setCustomerInput('');
          }}
          onChange={(value) => setCustomerInput(value)}
        />
        <AutoComplete
          value={materialInput}
          options={materialOptions}
          placeholder="Material"
          filterOption={(inputValue, option) =>
            option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
          }
          onSelect={(value) => {
            handleFilterUpdate('material', value);
            setMaterialInput('');
          }}
          onChange={(value) => setMaterialInput(value)}
        />
      </FiltersContainer>

      <TopResults>
        Showing top 20 results
        {!changed && hierarchy.length > 0 && ` for: ${hierarchy.join(' > ')}`}
      </TopResults>

      <ChartContainer>
        {chartData ? (
          <ReactECharts
            option={chartData}
            style={{ height: '400px', width: '100%' }}
            notMerge={true}
            lazyUpdate={true}
            onEvents={{
              click: (params: any) => {
                if (params.componentType === 'series') {
                  if (hierarchy.length <= 3) {
                    setHierarchy(prev => [...prev, params.name]);
                    loadBarGraph('hierarchy');
                  }
                }
              }
            }}
          />
        ) : (
          <div className="empty-state">No data available</div>
        )}
      </ChartContainer>
    </StyledContainer>
  );
}