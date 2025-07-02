"use client"

import type React from "react"

import { useState, useMemo, useCallback, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  TablePagination,
  TableSortLabel,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  CircularProgress,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import * as XLSX from "xlsx"
import { httpsGet, httpsPost } from "@/utils/Communication"; // Import httpsGet
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { environment } from '@/environments/env.api';
import { DateTime } from 'luxon';
import timeService from "@/utils/timeService";
// import utc from 'dayjs/plugin/utc';
// import timezone from 'dayjs/plugin/timezone';

// dayjs.extend(utc);
// dayjs.extend(timezone);

// Define types for our data structure
interface ShipperDetail {
  city: string
  rate?: number
  tonnage: number
  trips: number;
}

interface ShipmentData {
  _id:  string;
  city: string;
  tonnage: number;
  trips: number;
  shipments?: string[];
  shipper: string;
  freight: number;
  geo_point: {
    type: string;
    coordinates: [number, number];
  };
}

interface ProcessedData {
  id: string;
  sn: number;
  city: string;
  rate: number;
  trips: number;
  tonnage: number;
  freightValue: number;
  tonnagePercentage: number;
  freightPercentage: number;
  cumulativeTonnage: number;
  cumulativeFreight: number;
  is_last?: boolean;
  rate_short?: string;
  tonnage_short?: string;
  freight_short?: string;
}

interface CityOption {
  city: string;
  tonnage: number;
  _id: string;
}

// Styled components for the table
const StyledTableHead = styled(TableHead)(({ theme }) => ({
  "& .MuiTableCell-root": {
    backgroundColor: "#1c313a",
    color: "white",
    fontWeight: "bold",
    padding: theme.spacing(1.5),
    textAlign: "center",
    borderRight: "1px solid rgba(224, 224, 224, 1)",
  },
}))

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderRight: "1px solid rgba(224, 224, 224, 1)",
  padding: theme.spacing(1.5),
  textAlign: "center",
}))

const StyledPercentageCell = styled(TableCell)(({ theme }) => ({
  // backgroundColor: "#1c313a",
  color: "black",
  borderRight: "1px solid rgba(224, 224, 224, 1)",
  padding: theme.spacing(1.5),
  textAlign: "center",
}))

const StyledTableSortLabel = styled(TableSortLabel)(({ theme }) => ({
  "&.MuiTableSortLabel-root": {
    color: "white",
  },
  "&.MuiTableSortLabel-root:hover": {
    color: "white",
  },
  "&.Mui-active": {
    color: "white",
  },
  "& .MuiTableSortLabel-icon": {
    color: "white !important",
  },
}))

type Order = "asc" | "desc"

export default function InventoryDataTable() {
  const [data, setData] = useState<ShipmentData[] | null>(null)
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCitiesCount, setTotalCitiesCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0)
  const [rowsPerPage, setRowsPerPage] = useState<number>(15)
  const [order, setOrder] = useState<Order>("desc")
  const [orderBy, setOrderBy] = useState<any>('trips')
  const [selectedCity, setSelectedCity] = useState<string>('all_cities_id') // Initialized to 'all_cities_id'
  const [cityOptions, setCityOptions] = useState<CityOption[]>([])
  const [fromDate, setFromDate] = useState<number>(0);
  const [toDate, setToDate] = useState<number>(0);

  const [totalCount, setTotalCount] = useState<number>(0);
  const { PROD_SMART } = environment;


  // useEffect(() => {
  //   const fetchCityOptions = async () => {
  //     try {
  //       console.log("Fetching city options...");
  //       const response = await httpsGet(
  //         'city_for_route/getCitesForFilter',
  //         3,
  //         null
  //       );
  //       console.log("City options API Response:", response);
  //       if (!response.data) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }
  //       const json = response;
  //       console.log("City options JSON:", json);
  //       const citiesFromApi: CityOption[] = json.data.map((cityData: any) => ({
  //         city: cityData.city,
  //         tonnage: cityData.tonnage,
  //         _id: cityData._id
  //       }));
  //       // citiesFromApi.unshift({ city: "All Cities", tonnage: 0, _id: "all_cities_id" });
  //       setCityOptions(citiesFromApi);
  //       // Keep setSelectedCity("all_cities_id") here as well to ensure it's set after options load, just in case
  //       setSelectedCity(citiesFromApi[0]._id);
  //     } catch (e: any) {
  //       setError(e.message || "Could not fetch city options");
  //       console.error("Error fetching city options:", e);
  //       // Even on error, you might want to ensure a default city is selected or handle it appropriately.
  //       // For now, let's keep setSelectedCity("all_cities_id") even in the catch block, or you can decide on a different default.
  //       setSelectedCity("all_cities_id"); // Ensure selectedCity is set even if city options fail (optional - adjust as needed)
  //     }
  //   };

  //   fetchCityOptions();
  // }, []);

  const handleDateChange = (newDate: any, setDate: (value: number) => void, type="from") => {
    if (newDate) {
      let utc = DateTime.fromJSDate(new Date(newDate))
      console.log("UTC:", utc.toUTC().toMillis(), type, newDate);
      if (type == 'from') setDate(utc.startOf('day').toUTC().toMillis());
      else setDate(utc.endOf('day').toUTC().toMillis());
    }
  };

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const apiUrl = `routes/get_top_destinations?from=${fromDate}&to=${toDate}&skip=${page * rowsPerPage}&limit=${rowsPerPage}`;
      const response = await httpsGet(apiUrl, 0, null)

      if (!response.data?.data) throw new Error("No data returned");

      setData(response.data.data);
      setTotalCount(response.data.totalCount || 0);
    } catch (e: any) {
      setError(e.message || "Could not fetch data")
      setData([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  // useEffect(() => {
  //   fetchData();
  // }, [page, rowsPerPage]);

  useEffect(() => {
    const fromDateNew = DateTime.fromJSDate(new Date()).startOf('month').minus({ months: 1 }).toUTC().toMillis();
    const toDateNew = DateTime.fromJSDate(new Date()).endOf('month').minus({month: 1}).toUTC().toMillis();
    setFromDate(fromDateNew);
    setToDate(toDateNew);

    fetchData();
  }, [page, rowsPerPage]);

  const handleCityChange = (event: SelectChangeEvent) => {
    setSelectedCity(event.target.value as string)
    setPage(0)
  };


  // const processData = useCallback(async () => {
  //   setLoading(true);
  //   setError(null);
  //   setData(null);
  //   let fetchedData: ShipmentData[] = [];
  //   let totalCount = 0;

  //   try {
  //     const cityQuery = selectedCity === "all_cities_id" ? "" : `city=${selectedCity}`;
  //     let apiUrl = `city_for_route/getCityForRoute?`;
  //     if (cityQuery) {
  //       apiUrl += cityQuery;
  //     }
  //     console.log("Fetching data from API:", apiUrl);
  //     const response = await httpsGet(
  //       apiUrl,
  //       3,
  //       null
  //     );
  //     console.log("Data API Response:", response);

  //     if (!response.data) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     const json = response;
  //     console.log("Data JSON:", json);
  //     fetchedData = json.data.cities || [];
  //     totalCount = json.data.total || 0;
  //     setTotalCitiesCount(totalCount);
  //     setData(fetchedData.map((item: any) => ({
  //       ...item,
  //       _id: item._id.$oid,
  //       shipper: item.shipper?.$oid,
  //       details: item.details.map((detail: any) => ({
  //         ...detail,
  //         shipper: detail.shipper?.$oid,
  //       }))
  //     })));

  //   } catch (e: any) {
  //     setError(e.message || "Could not fetch inventory data");
  //     setData(null);
  //     setTotalCitiesCount(0);
  //     console.error("Error fetching inventory data:", e);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [selectedCity, page, rowsPerPage]);

  // useEffect(() => {
  //   console.log("Data Fetching useEffect triggered. selectedCity:", selectedCity); // ADDED LOG
  //   if (selectedCity) {
  //     processData();
  //   } else {
  //     console.log("Data Fetching useEffect: selectedCity is falsy, skipping API call."); // ADDED LOG
  //   }
  // }, [processData, selectedCity]);


  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    const totalTonnage = data.reduce((sum, city) => sum + city.tonnage, 0);
    const totalFreight = data.reduce((sum, city) => sum + city.freight, 0);

    let cumulativeTonnage = 0;
    let cumulativeFreight = 0;

    return data.map((city, index) => {

      const tonnagePercentage = totalTonnage ? (city.tonnage / totalTonnage) * 100 : 0;
      const freightPercentage = totalFreight ? (city.freight / totalFreight) * 100 : 0;

      cumulativeTonnage += tonnagePercentage;
      cumulativeFreight += freightPercentage;

      const tonnage_short = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(city.tonnage);
      const freight_short = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(city.freight);
      const cumulativeTonnage_short = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(cumulativeTonnage);
      const cumulativeFreight_short = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(cumulativeFreight);

      return {
        id: city._id,
        sn: index + 1,
        city: city.city,
        trips: city.trips,
        tonnage: city.tonnage,
        tonnage_short,
        freightValue: city.freight,
        freight_short,
        tonnagePercentage,
        freightPercentage,
        cumulativeTonnage: cumulativeTonnage_short,
        cumulativeFreight: cumulativeFreight_short,
      };
    })
  }, [data])


  const sortedData = useMemo(() => {
    const totalTonnage = processedData.reduce((sum, city) => sum + city.tonnage, 0);
    const totalFreight = processedData.reduce((sum, city) => sum + city.freightValue, 0);

    let cumulativeTonnage = 0;
    let cumulativeFreight = 0;

    return [...processedData].sort((a, b) => {
      if (!orderBy) return 0;
      if (orderBy === "tonnage") {
        return order === "desc" ? b.tonnage - a.tonnage : a.tonnage - b.tonnage
      }
      if (orderBy === "trips") {
        return order === "desc" ? b.trips - a.trips : a.trips - b.trips
      }
      if (orderBy === "freightValue") {
        return order === "desc" ? b.freightValue - a.freightValue : a.freightValue - b.freightValue
      }
      return 0;
    }).map((city, index) => {

      const tonnagePercentage = totalTonnage ? (city.tonnage / totalTonnage) * 100 : 0;
      const freightPercentage = totalFreight ? (city.freightValue / totalFreight) * 100 : 0;

      cumulativeTonnage += tonnagePercentage;
      cumulativeFreight += freightPercentage;

      const tonnage_short = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(city.tonnage);
      const freight_short = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(city.freightValue);
      const cumulativeTonnage_short = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(cumulativeTonnage);
      const cumulativeFreight_short = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(cumulativeFreight);

      return {
        id: city.id,
        sn: index + 1,
        city: city.city,
        trips: city.trips,
        tonnage: city.tonnage,
        tonnage_short,
        freightValue: city.freightValue,
        freight_short,
        tonnagePercentage,
        freightPercentage,
        cumulativeTonnage: cumulativeTonnage_short,
        cumulativeFreight: cumulativeFreight_short,
      };
    })
  }, [order, orderBy, processedData]);


  // const paginatedData = useMemo(() => {
  //   const pData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  //   console.log("paginatedData: showing", pData.length, "rows");
  //   return pData;
  // }, [sortedData, rowsPerPage, page]);

  const handleRequestSort = (property: any) => {
    const isAsc = orderBy === property && order === "asc"
    setOrder(isAsc ? "desc" : "asc")
    setOrderBy(property)
  }

  const exportToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(sortedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Data")
    XLSX.writeFile(workbook, "inventory_data.csv")
  }

  function handleCityClick (cityId: string) {
    console.log("City clicked:", cityId);
    window.open(`${PROD_SMART}routeMasterList?city_id=${cityId}`, '_self');
    // You can navigate to a new page or show a modal or do anything else here}
  }

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
      <CircularProgress />
    </Box>
  }

  if (error) {
    return <Box color="error.main" mt={2} textAlign="center">{error}</Box>;
  }


  return (
    <Box sx={{ width: "95%", margin: "56px 40px 0 70px", padding: "5px" }}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <div style={{ minWidth: 200, marginBottom: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "start" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 17 }}>
            <h3 style={{fontWeight: "bold", marginLeft: 5}}>Select Date Range</h3>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <div style={{ marginTop: "10px" }}>
                <DatePicker
                  label="From"
                  format="DD/MM/YYYY"
                  disableFuture
                  value={dayjs(fromDate)}
                  onChange={(newDate) => handleDateChange(newDate, setFromDate)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      width: "150px",
                      height: "36px",
                      fontSize: "14px", 
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "14px",
                    },
                    "& .MuiSvgIcon-root": {
                      fontSize: "18px", 
                    },
                  }}
                />
              </div>
              <div style={{ marginTop: "10px" }}>
                <DatePicker
                  label="To"
                  format="DD/MM/YYYY"
                  disableFuture
                  value={dayjs(toDate)}
                  onChange={(newDate) => handleDateChange(newDate, setToDate, 'to')}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      width: "150px",
                      height: "36px", 
                      fontSize: "14px",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "14px",
                    },
                    "& .MuiSvgIcon-root": {
                      fontSize: "18px", 
                    },
                  }}
                />
              </div>
            </LocalizationProvider>
            <Button sx={{ textTransform: "none", height: "36px", width: "88px", marginBottom: "-8px" }} variant="contained" onClick={fetchData}>Search</Button>
          </div>
        </div>

        <div style={{ marginBottom: 3, display: "flex", justifyContent: "space-between", alignItems: "center", marginRight: "15px", marginTop: "19px", flexDirection: "column" }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
            Total Cities: {totalCount}
          </Typography>
          <Button variant="contained" sx={{ textTransform: "none", height: "34px", marginBottom: "2px" }} onClick={exportToCSV}>
            Export to CSV
          </Button>
        </div>
      </div>

      <TablePagination
          rowsPerPageOptions={[5, 10, 15, 25, 50, 100]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
      />

      <div style={{ maxHeight: "74vh", border: "1px solid rgba(224, 224, 224, 1)", overflowY: "scroll" }}>
        <Table stickyHeader aria-label="inventory data table">
          <StyledTableHead>
            <TableRow>
              <TableCell>SN</TableCell>
              <TableCell>Destination</TableCell>
              <TableCell>
                <StyledTableSortLabel
                  active={orderBy === "trips"}
                  direction={orderBy === "trips" ? order : "desc"}
                  onClick={() => handleRequestSort("trips")}
                >
                  Trips (No.)
                </StyledTableSortLabel>
              </TableCell>
              <TableCell>
                <StyledTableSortLabel
                  active={orderBy === "tonnage"}
                  direction={orderBy === "tonnage" ? order : "desc"}
                  onClick={() => handleRequestSort("tonnage")}
                >
                  Tonnage (MT)
                </StyledTableSortLabel>
              </TableCell>
              <TableCell>
                <StyledTableSortLabel
                  active={orderBy === "freightValue"}
                  direction={orderBy === "freightValue" ? order : "desc"}
                  onClick={() => handleRequestSort("freightValue")}
                >
                  Freight (Rs.)
                </StyledTableSortLabel>
              </TableCell>
              <TableCell>
                % of Total
                <br />
                Tonnage
              </TableCell>
              <TableCell>
                % of Total
                <br />
                Freight
              </TableCell>
              <TableCell>
                % of Cum
                <br />
                Tonnage
              </TableCell>
              <TableCell>
                % of Cum
                <br />
                Freight
              </TableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {sortedData.map((item, index) => (
              <TableRow key={`${item.city}-${item.sn}`} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" } }}>
                <StyledTableCell>{index + 1 + page * rowsPerPage}</StyledTableCell>
                <StyledTableCell style={{cursor: 'pointer'}} onClick={() => handleCityClick(item.id)} >{item.city}</StyledTableCell>
                <StyledTableCell>{item.trips}</StyledTableCell>
                <StyledTableCell>{item.tonnage_short}</StyledTableCell>
                <StyledTableCell>{item.freight_short}</StyledTableCell>
                <StyledPercentageCell>{item.tonnagePercentage.toFixed(2)}</StyledPercentageCell>
                <StyledPercentageCell>{item.freightPercentage.toFixed(2)}</StyledPercentageCell>
                <StyledPercentageCell>{item.cumulativeTonnage}</StyledPercentageCell>
                <StyledPercentageCell>{item.cumulativeFreight}</StyledPercentageCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalCitiesCount} // Use totalCitiesCount from API response
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      /> */}
    </Box>
  )
}