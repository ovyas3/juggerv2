import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  TablePagination,
} from '@mui/material';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { httpsGet, httpsPost } from '@/utils/Communication';
import { useSnackbar } from '@/hooks/snackBar';
import { useRouter } from 'next/navigation';
import './Route.css';
import pickupIcon from '@/assets/pickupIcon.svg';
import { styled } from "@mui/material/styles";
import CloseButtonIcon from "@/assets/close_icon.svg";
import Image from 'next/image';
import Minus from '@/assets/minus.svg';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));


interface RouteData {
  _id: string;
  name: string;
  from: {
    _id: string;
    geo_point: {
      type: string;
      coordinates: [number, number];
    };
    code: string;
    name: string;
    zone: string;
    state: string;
  }[];
  to: {
    _id: string;
    geo_point: {
      type: string;
      coordinates: [number, number];
    };
    code: string;
    name: string;
    zone: string;
    cat?: string;
    state: string;
  }[];
  via: {
    _id: string;
    code: string;
    name: string;
    state: string;
    zone: string;
    geo_point: {
      type: string;
      coordinates: [number, number];
    };
    cat?: string;
  }[];
  shipper: string;
}

const blueIcon = L.icon({
  iconUrl: pickupIcon.src,
  iconSize: [15, 15],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

const redIcon = L.icon({
  iconUrl: '/assets/deliveryIcon.svg',
  iconSize: [15, 15],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

const greenIcon = L.icon({
  iconUrl: '/assets/halt_icon.svg',
  iconSize: [15, 15],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});


const Route = () => {
  const [routeData, setRouteData] = useState<RouteData[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const router = useRouter();
  const { showMessage } = useSnackbar();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [routeOpen, setRouteOpen] = useState(false);
  const [map, setMap] = useState<L.Map | null>(null);
  const [routeName, setRouteName] = useState('');

  // From Station States
  const [fromStationId, setFromStationId] = useState<string | null>(null);
  const [fromStationInput, setFromStationInput] = useState('');
  const [fromStationCode, setFromStationCode] = useState('');
  const [fromStationName, setFromStationName] = useState('');
  const [fromStationSuggestions, setFromStationSuggestions] = useState<{ _id: string, name: string }[]>([]);

  // To Station States
  const [toStationId, setToStationId] = useState<string | null>(null);
  const [toStationInput, setToStationInput] = useState('');
  const [toStationCode, setToStationCode] = useState('');
  const [toStationName, setToStationName] = useState('');
  const [toStationSuggestions, setToStationSuggestions] = useState<{ _id: string, name: string }[]>([]);

  // Via Station States
  const [viaStationInput, setViaStationInput] = useState<string>('');
  const [viaStationId, setViaStationId] = useState<string | null>(null);
  const [viaStationSuggestions, setViaStationSuggestions] = useState<{ _id: string, name: string }[]>([]);

  // Multiple Via Station States
  const [viaStations, setViaStations] = useState<{ _id: string, name: string }[]>([]);

  // Dropdown Ref & States
  const fromStationShowDropdownRef = useRef<HTMLDivElement>(null);
  const toStationShowDropdownRef = useRef<HTMLDivElement>(null);
  const viaStationShowDropdownRef = useRef<HTMLDivElement>(null);

  const [fromStationShowDropdown, setFromStationShowDropdown] = useState(false);
  const [toStationShowDropdown, setToStationShowDropdown] = useState(false);
  const [viaStationShowDropdown, setViaStationShowDropdown] = useState(false);

  const fetchRoutes = async () => {
    try {
      const response = await httpsGet('get/crRoute', 0, router);
      if (response.data) {
        setRouteData(response.data);
        if (response.data.length > 0) {
          setSelectedRoute(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [router]);

  // Add Route Dialog Functions

  const handleAddRouteClick = () => {
    setRouteOpen(true);
  };

  const handleRouteClose = () => {
    setRouteOpen(false);
  };


  // Pagination Functions
  const paginatedRouteData = routeData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // From Station Codes
  const handleFromStationInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFromStationInput(value);
    setFromStationShowDropdown(true);
    if (value.trim()) {
      handleFromStationSearch(value);
    } else {
      setFromStationId(null);
      setFromStationSuggestions([]);
      setFromStationShowDropdown(false);
    }
  };

  const handleFromStationSearch = async (input: string) => {
    const uppercaseInput = input.toUpperCase().trim();
    try {
      const response = await httpsGet(`get/station_code?stationCode=${uppercaseInput}`);
      if (response?.statusCode === 200) {
        setFromStationSuggestions(response.data);
      } else {
        setFromStationSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching from station:', error);
      setFromStationSuggestions([]);
    }
  };

  const handleFromStationSuggestionClick = (station: any) => {
    setFromStationInput(station.code);
    setFromStationName(station.name);
    setFromStationCode(station.code);
    setFromStationId(station._id);
    setFromStationSuggestions([]);
    setFromStationShowDropdown(false);
  };

  // To Station Codes

  const handleToStationInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setToStationInput(value);
    setToStationShowDropdown(true);
    if (value.trim()) {
      handleToStationSearch(value);
    } else {
      setToStationId(null);
      setToStationSuggestions([]);
      setToStationShowDropdown(false);
    }
  };

  const handleToStationSearch = async (input: string) => {
    const uppercaseInput = input.toUpperCase().trim();
    try {
      const response = await httpsGet(`get/station_code?stationCode=${uppercaseInput}`);
      if (response?.statusCode === 200) {
        setToStationSuggestions(response.data);
      } else {
        setToStationSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching to station:', error);
      setToStationSuggestions([]);
    }
  };

  const handleToStationSuggestionClick = (station: any) => {
    setToStationInput(station.code);
    setToStationName(station.name);
    setToStationCode(station.code);
    setToStationId(station._id);
    setToStationSuggestions([]);
    setToStationShowDropdown(false);
  };

  // Via Station Codes

  const handleViaStationInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setViaStationInput(value);
    setViaStationShowDropdown(true);
    if (value.trim()) {
      handleViaStationSearch(value);
    } else {
      setViaStationId(null);
      setViaStationSuggestions([]);
      setViaStationShowDropdown(false);
    }
  };

  const handleViaStationSearch = async (input: string) => {
    const uppercaseInput = input.toUpperCase().trim();
    try {
      const response = await httpsGet(`get/station_code?stationCode=${uppercaseInput}`);
      if (response?.statusCode === 200) {
        setViaStationSuggestions(response.data);
      } else {
        setViaStationSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching via station:', error);
      setViaStationSuggestions([]);
    }
  };

  const handleViaStationSuggestionClick = (station: any) => {
    if(viaStations.some((viaStation) => viaStation._id === station._id)) {
      showMessage('Via Station already added', 'error');
      return;
    }
    setViaStationInput('');
    setViaStationId(station._id);
    setViaStations([...viaStations, station]);
    setViaStationSuggestions([]);
    setViaStationShowDropdown(false);
  };

  const handleDeleteViaStation = (stationId: string) => {
    setViaStations(viaStations.filter((station) => station._id !== stationId));
  };

  // Add Route Function
  const handleAddRoute = async () => {
    if (routeName === '' || fromStationId === null || toStationId === null || viaStations.length === 0) {
      showMessage('Please fill all the fields', 'error');
      return;
    }

    const viaStationIds = viaStations.map((station) => station._id);
    try {
      const routeData = {
        name: routeName,
        from: fromStationId,
        to: toStationId,
        via: viaStationIds,
      };

      const response = await httpsPost('crroute/add', routeData, router);
      if (response && response.statusCode === 200) {
        showMessage('Route added successfully', 'success');
        handleRouteClose();
        setRouteName('');
        setFromStationId(null);
        setToStationId(null);
        setViaStations([]);
        setFromStationInput('');
        setToStationInput('');
        setViaStationInput('');
        setViaStationId(null);
        setFromStationSuggestions([]);
        setToStationSuggestions([]);
        setViaStationSuggestions([]);
        setViaStations([]);
        fetchRoutes();
      } else {
        showMessage('Failed to add route', 'error');
      }
    } catch (error) {
      console.error('Error adding route:', error);
      showMessage('An error occurred while adding route', 'error');
    }
  };

  // Outside Click for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromStationShowDropdownRef.current && !fromStationShowDropdownRef.current.contains(event.target as Node)) {
        setFromStationShowDropdown(false);
      }

      if (toStationShowDropdownRef.current && !toStationShowDropdownRef.current.contains(event.target as Node)) {
        setToStationShowDropdown(false);
      }

      if (viaStationShowDropdownRef.current && !viaStationShowDropdownRef.current.contains(event.target as Node)) {
        setViaStationShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className='route-settings-container'>
        <div className='route-settings-header'>
          <div className='route-settings-title'>Routes</div>
          <button className='route-settings-add-button' onClick={handleAddRouteClick}>Add Route</button>
        </div>
        <div className='route-settings-body'>
          <div className='route-settings-table-wrapper'>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 100]}
              component="div"
              count={routeData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Routes per page:"
            />
            <TableContainer
              component={Paper}
              sx={{
                maxHeight: 600,
                overflowY: 'auto'
              }}
            >
              <div className="route-settings-table-container">
                <Table stickyHeader className='route-settings-table'>
                  <TableHead
                    className="route-settings-table-head"
                  >
                    <TableRow>
                      <TableCell align="left" className="table-columns">#</TableCell>
                      <TableCell align="left" className="table-columns">Route Name</TableCell>
                      <TableCell align="left" className="table-columns">From</TableCell>
                      <TableCell align="left" className="table-columns">To</TableCell>
                      <TableCell align="left" className="table-columns">Via</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedRouteData && paginatedRouteData.length > 0 ?
                      paginatedRouteData.map((route: any, index: any) => (
                        <TableRow
                          key={route._id}
                          hover
                          onClick={() => {
                            setSelectedRoute({
                              data: [{
                                ...route,
                                from: route.from ? [route.from[0]] : [],
                                to: route.to ? [route.to[0]] : [],
                                via: route.via || []
                              }]
                            });
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <TableCell align="left" className="table-rows">{index + 1}</TableCell>
                          <TableCell align="left" className="table-rows">{route.name}</TableCell>
                          <TableCell align="left" className="table-rows">
                            <span style={{ fontWeight: 'bold' }}>{route.from[0]?.code || 'N/A'}</span> <br />
                            <span>{route.from[0]?.name || 'N/A'}</span>
                          </TableCell>
                          <TableCell align="left" className="table-rows">
                            <span style={{ fontWeight: 'bold' }}>{route.to[0]?.code || 'N/A'}</span> <br />
                            <span>{route.to[0]?.name || 'N/A'}</span>
                          </TableCell>
                          <TableCell align="left" className="table-rows">
                            {route.via.map((v: any) => (
                              <span key={v._id}>
                                <span style={{ fontWeight: 'bold' }}>{v.code || 'N/A'}</span> -
                                <span>{v.name || 'N/A'}</span>  <br />
                              </span>
                            )).reduce((prev: any, curr: any) => [prev, curr]) || 'N/A'}
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell
                            colSpan={16}
                            align="center"
                            style={{
                              padding: '20px',
                              fontSize: '12px',
                              color: '#42454E',
                              fontWeight: '600',
                              fontFamily: '"Inter", sans-serif',
                            }}
                          >
                            No Routes found
                          </TableCell>
                        </TableRow>
                      )}
                  </TableBody>
                </Table>
              </div>
            </TableContainer>
          </div>
          <div className='route-settings-map-view'>
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              style={{
                height: '400px',
                width: '100%'
              }}
              attributionControl={false}
              ref={setMap}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {selectedRoute?.data?.[0] && (
                <>
                  {selectedRoute.data[0].from?.[0]?.geo_point?.coordinates && (
                    <Marker
                      position={[
                        selectedRoute.data[0].from[0].geo_point.coordinates[1],
                        selectedRoute.data[0].from[0].geo_point.coordinates[0]
                      ]}
                      icon={blueIcon}
                    >
                      <Popup>From: {selectedRoute.data[0].from[0].name}</Popup>
                    </Marker>
                  )}
                  {selectedRoute.data[0].to?.[0]?.geo_point?.coordinates && (
                    <Marker
                      position={[
                        selectedRoute.data[0].to[0].geo_point.coordinates[1],
                        selectedRoute.data[0].to[0].geo_point.coordinates[0]
                      ]}
                      icon={redIcon}
                    >
                      <Popup>To: {selectedRoute.data[0].to[0].name}</Popup>
                    </Marker>
                  )}
                  {selectedRoute.data[0].via?.map((viaPoint: any, index: number) => (
                    viaPoint.geo_point?.coordinates && (
                      <Marker
                        key={viaPoint._id}
                        position={[
                          viaPoint.geo_point.coordinates[1],
                          viaPoint.geo_point.coordinates[0]
                        ]}
                        icon={greenIcon}
                      >
                        <Popup>Via: {viaPoint.name}</Popup>
                      </Marker>
                    )
                  ))}
                </>
              )}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Add New Routes Dialog */}
      <BootstrapDialog
        onClose={handleRouteClose}
        className="routes-settings-dialog-styles"
        aria-labelledby="customized-dialog-title"
        open={routeOpen}
      >
        <div className="routes-settings-dialog-container">
          <div
            aria-label="close"
            onClick={handleRouteClose}
            className="routes-settings-close-icon"
          >
            <Image src={CloseButtonIcon} alt="close" />
          </div>
        </div>

        <div className="routes-settings-dialog-body">
          <div className="routes-settings-dialog-title">Add Route</div>
          <div className="routes-settings-dialog-form">
            <div className="routes-settings-autocomplete-dropdown">
              <label htmlFor="routes-settings-station-input">Route Name</label>
              <input
                type="text"
                placeholder="Enter Route Name"
                value={routeName}
                id="routes-settings-station-input"
                onChange={(e) => setRouteName(e.target.value)}
              />
            </div>
            <div className="routes-settings-autocomplete-dropdown" ref={fromStationShowDropdownRef}>
              <label htmlFor="routes-settings-station-input">From</label>
              <input
                id="routes-settings-station-input"
                type="text"
                placeholder="Enter From Station Code"
                value={fromStationInput}
                onChange={handleFromStationInputChange}
                onFocus={() => fromStationInput && fromStationSuggestions.length > 0 && setFromStationShowDropdown(true)}
              />
              {fromStationShowDropdown && (
                <div className="routes-settings-dropdown">
                  <div className="routes-settings-dropdown-header">
                    {fromStationSuggestions.length} result(s) found
                  </div>
                  <ul>
                    {fromStationSuggestions.map((suggestion) => (
                      <li
                        key={suggestion._id}
                        onClick={() => handleFromStationSuggestionClick(suggestion)}
                        className="routes-settings-dropdown-item"
                      >
                        {suggestion.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="routes-settings-autocomplete-dropdown" ref={toStationShowDropdownRef}>
              <label htmlFor="routes-settings-station-input">To</label>
              <input
                id="routes-settings-station-input"
                type="text"
                placeholder="Enter To Station Code"
                value={toStationInput}
                onChange={handleToStationInputChange}
                onFocus={() => toStationInput && toStationSuggestions.length > 0 && setToStationShowDropdown(true)}
              />
              {toStationShowDropdown && (
                <div className="routes-settings-dropdown">
                  <div className="routes-settings-dropdown-header">
                    {toStationSuggestions.length} result(s) found
                  </div>
                  <ul>
                    {toStationSuggestions.map((suggestion) => (
                      <li
                        key={suggestion._id}
                        onClick={() => handleToStationSuggestionClick(suggestion)}
                        className="routes-settings-dropdown-item"
                      >
                        {suggestion.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="routes-settings-autocomplete-dropdown" ref={viaStationShowDropdownRef}>
              <label htmlFor="routes-settings-station-input">Via</label>
              <input
                id="routes-settings-station-input"
                type="text"
                placeholder="Enter Via Station Code"
                value={viaStationInput}
                onChange={handleViaStationInputChange}
                onFocus={() => viaStationInput && viaStationSuggestions.length > 0 && setViaStationShowDropdown(true)}
              />
              {viaStationShowDropdown && (
                <div className="routes-settings-dropdown">
                  <div className="routes-settings-dropdown-header">
                    {viaStationSuggestions.length} result(s) found
                  </div>
                  <ul>
                    {viaStationSuggestions.map((suggestion) => (
                      <li
                        key={suggestion._id}
                        onClick={() => handleViaStationSuggestionClick(suggestion)}
                        className="routes-settings-dropdown-item"
                      >
                        {suggestion.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className='routes-settings-display-routes'>
            <div className='routes-settings-display-routes-left-contents'>
              <div className='routes-settings-display-routes-left-content'>
                <div className='routes-settings-display-routes-left-content-title'>Route Name</div>
                <div className='routes-settings-display-routes-left-content-value'>{routeName}</div>
              </div>
              <div className='routes-settings-display-routes-left-content'>
                <div className='routes-settings-display-routes-left-content-title'>From Station</div>
                <div className='routes-settings-display-routes-left-content-value'>{fromStationCode} - {fromStationName}</div>
              </div>
              <div className='routes-settings-display-routes-left-content'>
                <div className='routes-settings-display-routes-left-content-title'>To Station</div>
                <div className='routes-settings-display-routes-left-content-value'>{toStationCode} - {toStationName}</div>
              </div>
            </div>
            <div className='routes-settings-display-routes-right-contents'>
              <div className='routes-settings-display-routes-right-content'>
                <div className='routes-settings-display-routes-right-content-title'>Via Stations</div>
                <div className='routes-settings-display-routes-right-content-value'>
                  {viaStations && viaStations.length > 0 &&
                    viaStations.map((viaStation: any, index: number) => {
                      return (
                        <div key={viaStation._id} className='routes-settings-display-routes-right-content-value-container'>
                          <div className='routes-settings-display-routes-right-content-value-index'>
                            {index + 1}. {viaStation.name}
                          </div>
                          {/* Delete Via Station */}
                          <div className='routes-settings-display-routes-right-content-value-delete'>
                            <Image src={Minus} alt="delete" onClick={() => handleDeleteViaStation(viaStation._id)} width={16} height={16} />
                          </div>
                        </div>
                      )
                    })
                  }

                  {/* No Via Stations */}
                  {viaStations && viaStations.length === 0 &&
                    <div className='routes-settings-display-routes-right-content-value-container'>
                      <div className='routes-settings-display-routes-right-content-value-index'>
                        No Via Stations
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
          <div className="routes-settings-dialog-footer">
            <button
              className="routes-settings-dialog-footer-cancel-button"
              onClick={handleRouteClose}>
              Cancel
            </button>
            <button
              className="routes-settings-dialog-footer-confirm-button"
              onClick={handleAddRoute}
            >
              Save
            </button>
          </div>
        </div>
      </BootstrapDialog>
    </>
  );
}

export default Route;