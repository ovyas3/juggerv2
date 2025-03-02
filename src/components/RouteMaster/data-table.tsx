"use client"

import { DataGrid, type GridColDef, type GridRowSelectionModel } from "@mui/x-data-grid"
import type { CityDataItem } from "./columns"

interface DataTableProps {
  columns: GridColDef[]
  data: CityDataItem[]
  onRowSelectionModelChange: (newRowSelectionModel: GridRowSelectionModel) => void
  rowSelectionModel: GridRowSelectionModel
}

export function DataTable({ columns, data, onRowSelectionModelChange, rowSelectionModel }: DataTableProps) {
  return (
    <DataGrid
      rows={data}
      columns={columns}
      getRowId={(row) => row._id}
      initialState={{
        pagination: {
          paginationModel: { pageSize: 15, page: 0 },
        },
      }}
      pageSizeOptions={[15, 25, 50]}
      checkboxSelection
      disableRowSelectionOnClick
      onRowSelectionModelChange={onRowSelectionModelChange}
      rowSelectionModel={rowSelectionModel}
    />
  )
}

