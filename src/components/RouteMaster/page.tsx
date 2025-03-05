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
  details: ShipperDetail[];
  shipper: string;
}

interface ProcessedData {
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
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)
  const [order, setOrder] = useState<Order>("desc")
  const [orderBy, setOrderBy] = useState<keyof ProcessedData>('trips')
  const [selectedCity, setSelectedCity] = useState<string>('all_cities_id') // Initialized to 'all_cities_id'
  const [cityOptions, setCityOptions] = useState<CityOption[]>([])


  useEffect(() => {
    const fetchCityOptions = async () => {
      try {
        console.log("Fetching city options...");
        const response = await httpsGet(
          'city_for_route/getCitesForFilter',
          3,
          null
        );
        console.log("City options API Response:", response);
        if (!response.data) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = response;
        console.log("City options JSON:", json);
        const citiesFromApi: CityOption[] = json.data.map((cityData: any) => ({
          city: cityData.city,
          tonnage: cityData.tonnage,
          _id: cityData._id
        }));
        // citiesFromApi.unshift({ city: "All Cities", tonnage: 0, _id: "all_cities_id" });
        setCityOptions(citiesFromApi);
        // Keep setSelectedCity("all_cities_id") here as well to ensure it's set after options load, just in case
        setSelectedCity(citiesFromApi[0]._id);
      } catch (e: any) {
        setError(e.message || "Could not fetch city options");
        console.error("Error fetching city options:", e);
        // Even on error, you might want to ensure a default city is selected or handle it appropriately.
        // For now, let's keep setSelectedCity("all_cities_id") even in the catch block, or you can decide on a different default.
        setSelectedCity("all_cities_id"); // Ensure selectedCity is set even if city options fail (optional - adjust as needed)
      }
    };

    fetchCityOptions();
  }, []);


  const handleCityChange = (event: SelectChangeEvent) => {
    setSelectedCity(event.target.value as string)
    setPage(0)
  };


  const processData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    let fetchedData: ShipmentData[] = [];
    let totalCount = 0;

    try {
      const cityQuery = selectedCity === "all_cities_id" ? "" : `city=${selectedCity}`;
      let apiUrl = `city_for_route/getCityForRoute?`;
      if (cityQuery) {
        apiUrl += cityQuery;
      }
      console.log("Fetching data from API:", apiUrl);
      const response = await httpsGet(
        apiUrl,
        3,
        null
      );
      console.log("Data API Response:", response);

      if (!response.data) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = response;
      console.log("Data JSON:", json);
      fetchedData = json.data.cities || [];
      totalCount = json.data.total || 0;
      setTotalCitiesCount(totalCount);
      setData(fetchedData.map((item: any) => ({
        ...item,
        _id: item._id.$oid,
        shipper: item.shipper?.$oid,
        details: item.details.map((detail: any) => ({
          ...detail,
          shipper: detail.shipper?.$oid,
        }))
      })));

    } catch (e: any) {
      setError(e.message || "Could not fetch inventory data");
      setData(null);
      setTotalCitiesCount(0);
      console.error("Error fetching inventory data:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedCity, page, rowsPerPage]);

  useEffect(() => {
    console.log("Data Fetching useEffect triggered. selectedCity:", selectedCity); // ADDED LOG
    if (selectedCity) {
      processData();
    } else {
      console.log("Data Fetching useEffect: selectedCity is falsy, skipping API call."); // ADDED LOG
    }
  }, [processData, selectedCity]);


  const processedData = useMemo(() => {
    if (!data) {
      console.log("processedData: data is null or undefined, returning empty array");
      return [];
    }
    console.log("Data received for processing:", data);

    return data.flatMap((cityData) => {
      const processedDetails = cityData.details.filter((detail) => detail.rate !== undefined);

      // Calculate total tonnage and freight for the city
      const totalTonnage = processedDetails.reduce((sum, detail) => sum + detail.tonnage, 0)
      const totalFreight = processedDetails.reduce((sum, detail) => sum + (detail.rate || 0), 0)

      let cumulativeTonnage = 0
      let cumulativeFreight = 0
      const number_of_details = processedDetails.length;
      return processedDetails
        .sort((a, b) => b.tonnage - a.tonnage)
        .map((detail, index) => {
          const tonnagePercentage = (detail.tonnage / totalTonnage) * 100
          const freightValue = detail.rate || 0
          const freightPercentage = (freightValue / totalFreight) * 100

          cumulativeTonnage += tonnagePercentage
          cumulativeFreight += freightPercentage

          const tonnage_short = new Intl.NumberFormat("en-IN", {
            maximumFractionDigits: 2,
          }).format(detail.tonnage);
          const rate_short = new Intl.NumberFormat("en-IN", {
            maximumFractionDigits: 2,
          }).format(detail.rate || 0);
          const freight_short = new Intl.NumberFormat("en-IN", {
            maximumFractionDigits: 2,
          }).format(freightValue);
          const cumulativeTonnage_short = new Intl.NumberFormat("en-IN", {
            maximumFractionDigits: 2,
          }).format(cumulativeTonnage);
          const cumulativeFreight_short = new Intl.NumberFormat("en-IN", {
            maximumFractionDigits: 2,
          }).format(cumulativeFreight);

          return {
            sn: index + 1,
            city: cityData.city,
            rate: detail.rate || 0,
            rate_short,
            trips: detail.trips,
            tonnage: detail.tonnage,
            tonnage_short,
            freightValue,
            freight_short,
            tonnagePercentage,
            freightPercentage,
            cumulativeTonnage: cumulativeTonnage_short,
            cumulativeFreight: cumulativeFreight_short,
            is_last: index === number_of_details - 1,
          }
        })
    })
  }, [data])


  const sortedData = useMemo(() => {
    console.log("sortedData: processedData length", processedData.length);
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
    });
  }, [order, orderBy, processedData]);


  // const paginatedData = useMemo(() => {
  //   const pData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  //   console.log("paginatedData: showing", pData.length, "rows");
  //   return pData;
  // }, [sortedData, rowsPerPage, page]);

  const handleRequestSort = (property: keyof ProcessedData) => {
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
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
          Total Cities: {totalCitiesCount}
        </Typography>
        <Button variant="contained" onClick={exportToCSV}>
          Export to CSV
        </Button>
      </Box>

      <FormControl sx={{ minWidth: 200, mb: 2 }}>
        <InputLabel id="city-select-label">Select City</InputLabel>
        <Select
          labelId="city-select-label"
          id="city-select"
          value={selectedCity}
          label="Select City"
          onChange={handleCityChange}
        >
          {cityOptions.map((option) => (
            <MenuItem key={option._id} value={option._id}>
              {option.city} {option.city !== "All Cities" ? `- ${option.tonnage.toFixed(2)}` : ""}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TableContainer component={Paper} sx={{ maxHeight: 780, border: "1px solid rgba(224, 224, 224, 1)" }}>
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
              <TableRow key={`${item.city}-${item.sn}`} style={{fontWeight: item.is_last ? 'bolder': '' }} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" } }}>
                <StyledTableCell>{index + 1 + page * rowsPerPage}</StyledTableCell>
                <StyledTableCell>{item.city}</StyledTableCell>
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
      </TableContainer>
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