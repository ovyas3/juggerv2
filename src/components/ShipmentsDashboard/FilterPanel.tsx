import React, { useState, useEffect } from 'react';
import {
  Box,
  Collapse,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  Paper,
  Switch,
  TextField,
  Typography,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
  Chip,
  Stack,
  Button,
  useTheme,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  FilterAltOff as ClearFiltersIcon,
} from '@mui/icons-material';
import { MapFilterOptions, VehicleStatus, ShipmentStatus } from './mapViewTypes';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MapFilterOptions;
  onFiltersChange: (filters: MapFilterOptions) => void;
  availableVehicleTypes: string[];
  availableStatuses: (VehicleStatus | ShipmentStatus)[];
  className?: string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableVehicleTypes = [],
  availableStatuses = [],
  className = '',
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(filters.vehicleTypes || []);
  const [selectedStatuses, setSelectedStatuses] = useState<(VehicleStatus | ShipmentStatus)[]>([]);
  const [showOnlyWithAlerts, setShowOnlyWithAlerts] = useState(filters.showOnlyWithAlerts || false);
  const [showOnlyDelayed, setShowOnlyDelayed] = useState(filters.showOnlyDelayed || false);

  // Update local state when filters prop changes
  useEffect(() => {
    setSearchQuery(filters.searchQuery || '');
    setSelectedTypes(filters.vehicleTypes || []);
    // setSelectedStatuses(filters.statuses || []);
    setShowOnlyWithAlerts(filters.showOnlyWithAlerts || false);
    setShowOnlyDelayed(filters.showOnlyDelayed || false);
  }, [filters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({
      ...filters,
      searchQuery: searchQuery.trim(),
    });
  };

  const handleTypeChange = (event: SelectChangeEvent<typeof selectedTypes>) => {
    const value = event.target.value;
    const newSelectedTypes = typeof value === 'string' ? value.split(',') : value;
    setSelectedTypes(newSelectedTypes);
    onFiltersChange({
      ...filters,
      vehicleTypes: newSelectedTypes,
    });
  };

  const handleStatusChange = (event: SelectChangeEvent<typeof selectedStatuses>) => {
    const value = event.target.value;
    const newSelectedStatuses = typeof value === 'string' ? [value as VehicleStatus | ShipmentStatus] : value as (VehicleStatus | ShipmentStatus)[];
    setSelectedStatuses(newSelectedStatuses);
    onFiltersChange({
      ...filters,
      statuses: newSelectedStatuses,
    });
  };

  const handleToggleAlerts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setShowOnlyWithAlerts(checked);
    onFiltersChange({
      ...filters,
      showOnlyWithAlerts: checked,
    });
  };

  const handleToggleDelayed = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setShowOnlyDelayed(checked);
    onFiltersChange({
      ...filters,
      showOnlyDelayed: checked,
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setShowOnlyWithAlerts(false);
    setShowOnlyDelayed(false);
    
    // onFiltersChange({
    //   searchQuery: '',
    //   vehicleTypes: [],
    //   statuses: [],
    //   showOnlyWithAlerts: false,
    //   showOnlyDelayed: false,
    //   dateRange: { start: null, end: null },
    // });
  };

  return (
    <Box
      className={className}
      sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 1,
        width: 300,
        maxWidth: 'calc(100% - 32px)',
        transition: 'transform 0.3s ease-in-out',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
    >
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2, overflow: 'hidden' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Filters
          </Typography>
          <Box>
            <Button
              size="small"
              startIcon={<ClearFiltersIcon />}
              onClick={handleClearFilters}
              disabled={!searchQuery && selectedTypes.length === 0 && selectedStatuses.length === 0 && !showOnlyWithAlerts && !showOnlyDelayed}
            >
              Clear
            </Button>
            <IconButton onClick={onClose} size="small" sx={{ ml: 1 }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        
        <form onSubmit={handleSearchSubmit}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search vehicles & shipments..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 },
            }}
            size="small"
          />
        </form>

        <Divider sx={{ my: 2 }} />

        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            Vehicle Types
          </Typography>
          <Select
            multiple
            value={selectedTypes}
            onChange={handleTypeChange}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
            fullWidth
            size="small"
            displayEmpty
            sx={{
              '& .MuiSelect-select': {
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                py: 0.5,
              },
            }}
          >
            {availableVehicleTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            Status
          </Typography>
          <Select
            multiple
            value={selectedStatuses}
            onChange={handleStatusChange}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">
                    Any status
                  </Typography>
                ) : (
                  selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))
                )}
              </Box>
            )}
            fullWidth
            size="small"
            displayEmpty
            sx={{
              '& .MuiSelect-select': {
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                py: 0.5,
              },
            }}
          >
            {availableStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={showOnlyWithAlerts}
                onChange={handleToggleAlerts}
                size="small"
                color="primary"
              />
            }
            label="Show only with alerts"
            sx={{ mb: 1 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={showOnlyDelayed}
                onChange={handleToggleDelayed}
                size="small"
                color="warning"
              />
            }
            label="Show only delayed"
          />
        </FormGroup>
      </Paper>
    </Box>
  );
};

export default FilterPanel;
