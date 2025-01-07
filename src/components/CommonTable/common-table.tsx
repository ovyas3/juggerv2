"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Skeleton,
  useTheme,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Popover,
  Chip,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  Autocomplete,
  Tooltip,
  Fade,
} from '@mui/material';
import { Search, RefreshRounded, FilterList, Close, Add, Clear } from '@mui/icons-material';
import { httpsGet,httpsPost } from "@/utils/Communication";
import { useRouter } from "next/navigation";

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any, rowIndex?: number) => string | number;
  filterable?: boolean;
  sortable?: boolean;
}

interface Filter {
  column: string;
  operator: string;
  value: string;
}

type Order = 'asc' | 'desc';

interface CommonTableProps {
  title: string;
  endpoint: string;
  columns: Column[];
  initialData?: any[];
  payload?: any;
  onRefresh?: () => void;
  searchEnabled?: boolean;
  open: boolean;
  onClose: () => void;
}

const operators = {
  string: ['contains', 'equals', 'starts with', 'ends with'],
  number: ['equals', 'greater than', 'less than', 'between'],
  date: ['equals', 'after', 'before', 'between'],
};

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (orderBy === 'sl_no') {
    return (b[orderBy] as number) - (a[orderBy] as number);
  }

  const aValue = a[orderBy];
  const bValue = b[orderBy];

  // Handle formatted values
  if (typeof aValue === 'object' && aValue?.name) {
    if (bValue?.name < aValue?.name) return -1;
    if (bValue?.name > aValue?.name) return 1;
    return 0;
  }

  // Handle date values
  if (aValue && bValue && !isNaN(Date.parse(aValue as string)) && !isNaN(Date.parse(bValue as string))) {
    return new Date(bValue as string).getTime() - new Date(aValue as string).getTime();
  }

  // Handle regular values
  if (bValue < aValue) return -1;
  if (bValue > aValue) return 1;
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: number | string | object }, b: { [key in Key]: number | string | object }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const CommonTable: React.FC<CommonTableProps> = ({
  title,
  endpoint,
  columns,
  initialData,
  payload,
  onRefresh,
  searchEnabled = true,
  open,
  onClose,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [data, setData] = useState<any[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState<string>('all');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [currentFilter, setCurrentFilter] = useState<Filter>({
    column: '',
    operator: '',
    value: '',
  });
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const router = useRouter();
  const theme = useTheme();

  const filterableColumns = columns.filter(col => col.filterable !== false);

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
    setCurrentFilter({ column: '', operator: '', value: '' });
  };

  const handleAddFilter = () => {
    if (currentFilter.column && currentFilter.operator && currentFilter.value) {
      setActiveFilters([...activeFilters, currentFilter]);
      setCurrentFilter({ column: '', operator: '', value: '' });
      applyFilters([...activeFilters, currentFilter]);
      handleFilterClose();
    }
  };

  const handleRemoveFilter = (index: number) => {
    const newFilters = activeFilters.filter((_, i) => i !== index);
    setActiveFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (filters: Filter[]) => {
    let result = [...data];
    
    // Apply search
    if (searchQuery) {
      result = result.filter((row) => {
        if (searchColumn === 'all') {
          return Object.entries(row).some(([key, value]) => {
            const column = columns.find(col => col.id === key);
            if (!column?.filterable) return false;
            const formattedValue = column.format ? column.format(value) : value;
            return String(formattedValue).toLowerCase().includes(searchQuery.toLowerCase());
          });
        } else {
          const column = columns.find(col => col.id === searchColumn);
          if (!column) return false;
          const value = column.format ? column.format(row[searchColumn]) : row[searchColumn];
          return String(value).toLowerCase().includes(searchQuery.toLowerCase());
        }
      });
    }

    // Apply filters
    filters.forEach(filter => {
      const column = columns.find(col => col.id === filter.column);
      result = result.filter(item => {
        const value = column?.format ? column.format(item[filter.column]) : item[filter.column];
        switch (filter.operator) {
          case 'contains':
            return String(value).toLowerCase().includes(filter.value.toLowerCase());
          case 'equals':
            return String(value).toLowerCase() === filter.value.toLowerCase();
          case 'starts with':
            return String(value).toLowerCase().startsWith(filter.value.toLowerCase());
          case 'ends with':
            return String(value).toLowerCase().endsWith(filter.value.toLowerCase());
          case 'greater than':
            return Number(value) > Number(filter.value);
          case 'less than':
            return Number(value) < Number(filter.value);
          case 'after':
            return new Date(value) > new Date(filter.value);
          case 'before':
            return new Date(value) < new Date(filter.value);
          default:
            return true;
        }
      });
    });

    // Apply sorting if active
    if (orderBy) {
      result.sort(getComparator(order, orderBy));
    }
    
    setFilteredData(result);
  };

  const getColumnType = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column) return 'string';
    
    // Try to determine type based on sample data
    const sampleValue = data[0]?.[columnId];
    if (typeof sampleValue === 'number') return 'number';
    if (!isNaN(Date.parse(String(sampleValue)))) return 'date';
    return 'string';
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await httpsPost(endpoint, payload || {}, router, 1);
      if (response?.statusCode === 200) {
        const dataWithIndex = response.data.map((item: any, index: number) => ({
          ...item,
          sl_no: index + 1
        }));
        setData(dataWithIndex);
        setFilteredData(dataWithIndex);
        // Reset sorting and filters
        setOrder('asc');
        setOrderBy('');
        setActiveFilters([]);
        setSearchQuery('');
        setSearchColumn('all');
        // Update search suggestions
        updateSearchSuggestions(dataWithIndex);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  const updateSearchSuggestions = useCallback((currentData: any[]) => {
    const uniqueValues = new Set<string>();
    currentData.forEach(row => {
      Object.entries(row).forEach(([key, value]) => {
        const column = columns.find(col => col.id === key);
        if (column?.filterable) {
          const formattedValue = column.format ? column.format(value) : value;
          if (formattedValue) {
            uniqueValues.add(String(formattedValue));
          }
        }
      });
    });
    setSuggestions(Array.from(uniqueValues));
  }, [columns]);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [endpoint, payload, open]);

  useEffect(() => {
    applyFilters(activeFilters);
  }, [searchQuery, searchColumn, data, order, orderBy]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      fetchData();
    }
  };

  const handleClose = () => {
    // Reset all states
    setOrder('asc');
    setOrderBy('');
    setActiveFilters([]);
    setSearchQuery('');
    setSearchColumn('all');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexGrow: 1 }}>
            {searchEnabled && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexGrow: 1 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={searchColumn}
                    onChange={(e) => setSearchColumn(e.target.value)}
                    sx={{ borderRadius: '8px 0 0 8px' }}
                  >
                    <MenuItem value="all">All Columns</MenuItem>
                    {filterableColumns.map((column) => (
                      <MenuItem key={column.id} value={column.id}>
                        {column.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Autocomplete
                  freeSolo
                  size="small"
                  options={suggestions}
                  value={searchQuery}
                  onChange={(_, newValue) => setSearchQuery(newValue || '')}
                  onInputChange={(_, newValue) => setSearchQuery(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <React.Fragment>
                            {searchQuery && (
                              <IconButton
                                size="small"
                                onClick={() => setSearchQuery('')}
                                sx={{ mr: 1 }}
                              >
                                <Clear fontSize="small" />
                              </IconButton>
                            )}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                      sx={{
                        width: 300,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '0 8px 8px 0',
                        }
                      }}
                    />
                  )}
                />
              </Box>
            )}
            <Stack direction="row" spacing={1}>
              {activeFilters.map((filter, index) => (
                <Chip
                  key={index}
                  label={`${columns.find(col => col.id === filter.column)?.label || filter.column} ${filter.operator} ${filter.value}`}
                  onDelete={() => handleRemoveFilter(index)}
                  size="small"
                />
              ))}
            </Stack>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh data" TransitionComponent={Fade} arrow>
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshRounded />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add filter" TransitionComponent={Fade} arrow>
              <IconButton onClick={handleFilterClick}>
                <FilterList />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Popover
          open={Boolean(filterAnchorEl)}
          anchorEl={filterAnchorEl}
          onClose={handleFilterClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              p: 2,
              width: 300,
              bgcolor: 'background.paper',
              borderRadius: '8px',
            }
          }}
        >
          <Stack spacing={2}>
            <Typography variant="subtitle2" fontWeight="bold">
              Add Filter
            </Typography>
            <FormControl size="small" fullWidth>
              <InputLabel>Column</InputLabel>
              <Select
                value={currentFilter.column}
                onChange={(e) => setCurrentFilter({
                  ...currentFilter,
                  column: e.target.value as string,
                  operator: '',
                  value: ''
                })}
                input={<OutlinedInput label="Column" />}
              >
                {filterableColumns.map((column) => (
                  <MenuItem key={column.id} value={column.id}>
                    {column.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {currentFilter.column && (
              <FormControl size="small" fullWidth>
                <InputLabel>Operator</InputLabel>
                <Select
                  value={currentFilter.operator}
                  onChange={(e) => setCurrentFilter({
                    ...currentFilter,
                    operator: e.target.value as string
                  })}
                  input={<OutlinedInput label="Operator" />}
                >
                  {operators[getColumnType(currentFilter.column)].map((op) => (
                    <MenuItem key={op} value={op}>
                      {op}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            {currentFilter.operator && (
              <TextField
                size="small"
                label="Value"
                value={currentFilter.value}
                onChange={(e) => setCurrentFilter({
                  ...currentFilter,
                  value: e.target.value
                })}
                fullWidth
              />
            )}
            
            <Button
              variant="contained"
              onClick={handleAddFilter}
              disabled={!currentFilter.column || !currentFilter.operator || !currentFilter.value}
              startIcon={<Add />}
            >
              Add Filter
            </Button>
          </Stack>
        </Popover>

        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                    sortDirection={orderBy === column.id ? order : false}
                    sx={{
                      backgroundColor: theme.palette.background.paper,
                      fontWeight: 'bold',
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                      hideSortIcon={!column.sortable}
                      sx={{
                        '& .MuiTableSortLabel-icon': {
                          opacity: column.sortable ? undefined : 0
                        }
                      }}
                    >
                      {column.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from(new Array(rowsPerPage)).map((_, index) => (
                  <TableRow key={index}>
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex}>
                        <Skeleton animation="wave" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format ? column.format(value, index) : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Button onClick={handleClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommonTable;