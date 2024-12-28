"use client";

import React, { useState } from 'react';
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
} from '@mui/material';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { httpsGet } from '@/utils/Communication';
import { useRouter } from 'next/navigation';

const ROUTE_DATA = [
  { 
    sno: 1, 
    from: 'Mumbai', 
    to: 'Delhi', 
    via: 'Vadodara', 
    coordinates: {
        from: { lat: 19.0760, lng: 72.8777 },
        to: { lat: 28.7041, lng: 77.1025 },
        via: { lat: 22.3072, lng: 73.1812 }
      }
  },
  { 
    sno: 2, 
    from: 'Kolkata', 
    to: 'Chennai', 
    via: 'Bhubaneswar', 
    coordinates: {
      from: { lat: 22.5726, lng: 88.3639 },
      to: { lat: 13.0827, lng: 80.2707 },
      via: { lat: 20.2961, lng: 85.8245 }
    }
  }
];


const Route = () => {
  const [selectedRoute, setSelectedRoute] = useState(ROUTE_DATA[0]);
  const [openAddRouteDialog, setOpenAddRouteDialog] = useState(false);
  const router = useRouter();


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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddRouteDialog} color="primary" style={{border: '1px solid #1565c0', marginRight: '5px'}}>
            Cancel
          </Button>
          <Button 
            onClick={handleCloseAddRouteDialog} 
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
                <TableCell>Via</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ROUTE_DATA.map((route) => (
                <TableRow 
                  key={route.sno} 
                  hover 
                  onClick={() => setSelectedRoute(route)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>{route.sno}</TableCell>
                  <TableCell>{route.from}</TableCell>
                  <TableCell>{route.to}</TableCell>
                  <TableCell>{route.via}</TableCell>
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
            
        </MapContainer>
      </Grid>
    </Grid>
  );
}

export default Route;