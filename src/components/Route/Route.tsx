import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  Typography,
} from '@mui/material';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import Image from 'next/image';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { httpsGet } from '@/utils/Communication';
import { httpsPost } from '@/utils/Communication';
import { useSnackbar } from '@/hooks/snackBar';
import { useRouter } from 'next/navigation';
import totalRakesIcon from "/assets/total_rakes.svg";
import deliveryIcon from "/assets/deliveryIcon.svg";
import haltIcon from "/assets/halt_icon.svg";
import { 
  IconButton,
} from '@mui/material';
import './Route.css';
import { Label } from 'recharts';
import pickupIcon from '@/assets/pickupIcon.svg';
console.log('pickupIcon path:', pickupIcon);

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
  const [openAddRouteDialog, setOpenAddRouteDialog] = useState(false);
  const router = useRouter();
  const { showMessage } = useSnackbar();
  const [fromLocations, setFromLocations] = useState<any[]>([]);
  const [toLocations, setToLocations] = useState<any[]>([]);
  const [viaLocations, setViaLocations] = useState<any[]>([]);
  const [selectedFrom, setSelectedFrom] = useState<string>('');
  const [selectedTo, setSelectedTo] = useState<string>('');
  const [selectedVia, setSelectedVia] = useState<string>('');
  const [selectedName, setSelectedName] = useState<string>('');


  useEffect(() => {
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

    fetchRoutes();
  }, [router]);

  const handleAddRoute = async () => {
    try {
      if (!selectedName) {
        showMessage('Please enter Route Name', 'error');
        return;
      }

      if (!selectedFrom) {
        showMessage('Please Enter a From Location', 'error');
        return;
      }

      if(!validateLocation(selectedFrom)){
        showMessage('Invalid From Location', 'error');
        return;
      }

      if (!selectedTo) {
        showMessage('Please Enter a To Location', 'error');
        return;
      }

      if(!validateLocation(selectedTo)){
        showMessage('Invalid To Location', 'error');
        return;
      }

      if (selectedVia) {
        if(!validateLocation(selectedVia)){
          showMessage('Invalid Via Location', 'error');
          return;
        }
      }

      const routeData = {
        from: selectedFrom,
        to: selectedTo,
        name: selectedName,
        via: selectedVia ? [selectedVia] : []
      };
  
      const response = await httpsPost(
        'crroute/add', 
        routeData, 
        router,
        0, 
      );
  
      if (response?.statusCode === 200) {
        showMessage('Route added successfully', 'success');
        handleCloseAddRouteDialog();
      } 
    } catch (error) {
      console.error('Error adding route:', error);
      showMessage('Something went wrong', 'error');
    }
  };

  const validateLocation = (location: string): boolean => {
    const locationRegex = /^[0-9a-fA-F]{24}$/;
    return locationRegex.test(location);
  };
;

  const handleAddRouteClick = () => {
    setOpenAddRouteDialog(true);
  };

  const handleCloseAddRouteDialog = () => {
    setOpenAddRouteDialog(false);
  };

  return (
    <Grid container spacing={2}>
        <Grid item xs={12}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAddRouteClick}
        >
          Add Route
        </Button>
      </Grid>

      <Dialog
        open={openAddRouteDialog}
        onClose={handleCloseAddRouteDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Route</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Route Name
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={selectedName}
                onChange={(e) => setSelectedName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                From Location
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={selectedFrom}
                onChange={(e) => setSelectedFrom(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                To Location
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={selectedTo}
                onChange={(e) => setSelectedTo(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Via Location 
              </Typography>
                <Select
                  value={selectedVia}
                  onChange={(e) => setSelectedVia(e.target.value)}
                >
                   <MenuItem value="Cb4efd7eEFDcEDAD6D49CEe0">Cb4efd7eEFDcEDAD6D49CEe0</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-start', padding: 2 }}>
          <Button 
            onClick={handleCloseAddRouteDialog} 
            color="primary" 
            style={{border: '1px solid #1565c0', marginLeft: '9px',marginRight: '7px'}}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddRoute} 
            color="primary" 
            variant="contained"
            style={{marginRight: '15px'}}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Grid item xs={12} md={6}>
      <TableContainer 
          component={Paper} 
          sx={{ 
            maxHeight: 600, 
            overflowY: 'auto' 
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>S.No</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>Route Name</TableCell>
                <TableCell>Via</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {routeData.map((route: any, index: any) => (
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
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{route.from[0]?.name || 'N/A'}</TableCell>
                  <TableCell>{route.to[0]?.name || 'N/A'}</TableCell>
                  <TableCell>{route.name}</TableCell>
                  <TableCell>{route.via.map((v:any) => v.name).join(', ') || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>     
          </Table>
        </TableContainer>
      </Grid>

      {/* Map View */}
      <Grid item xs={12} md={6}>
        <MapContainer 
          center={[20.5937, 78.9629]} 
          zoom={5} 
          style={{ height: '400px', width: '100%' }}
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
      </Grid>
    </Grid>
  );
}

export default Route;