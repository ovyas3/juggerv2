"use client"

import type React from "react"
import type { GridColDef } from "@mui/x-data-grid"
import { Button } from "@mui/material"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import { useState } from "react"

export type CityDataItem = {
  _id: string
  city: string
  tonnage: number
  trips: number
  details: {
    city: string
    rate: number
    tonnage: number
    trips: number
    shipper: string
  }[]
  shipper: string
}

export const CityColumns: GridColDef[] = [
  {
    field: "city",
    headerName: "City",
    width: 150,
    renderHeader: (params) => {
      const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null)
      return (
        <Button
          variant="text"
          onClick={() => {
            const newDirection = sortDirection === "asc" ? "desc" : "asc"
            setSortDirection(newDirection)
            params.api?.setSortModel([{ field: "city", sort: newDirection }])
          }}
          endIcon={sortDirection === "asc" ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
        >
          City
        </Button>
      )
    },
  },
  {
    field: "trips",
    headerName: "Trips",
    type: "number",
    width: 110,
    renderHeader: (params) => {
      const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null)
      return (
        <Button
          variant="text"
          onClick={() => {
            const newDirection = sortDirection === "asc" ? "desc" : "asc"
            setSortDirection(newDirection)
            params.api?.setSortModel([{ field: "trips", sort: newDirection }])
          }}
          endIcon={sortDirection === "asc" ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
        >
          Trips
        </Button>
      )
    },
  },
  {
    field: "tonnage",
    headerName: "Tonnage",
    type: "number",
    width: 160,
    renderHeader: (params) => {
      const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null)
      return (
        <Button
          variant="text"
          onClick={() => {
            const newDirection = sortDirection === "asc" ? "desc" : "asc"
            setSortDirection(newDirection)
            params.api?.setSortModel([{ field: "tonnage", sort: newDirection }])
          }}
          endIcon={sortDirection === "asc" ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
        >
          Tonnage
        </Button>
      )
    },
    valueFormatter: (params) => params.value?.toFixed(2),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 100,
    renderCell: (params) => {
      const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
      const open = Boolean(anchorEl)
      const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
      }
      const handleClose = () => {
        setAnchorEl(null)
      }

      return (
        <>
          <Button
            id="basic-button"
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
          >
            <MoreHorizIcon />
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <MenuItem onClick={handleClose}>View details</MenuItem>
            <MenuItem onClick={handleClose}>Edit</MenuItem>
          </Menu>
        </>
      )
    },
  },
]

