'use client'
import React, { useEffect, useState } from 'react';
import { DataGrid, GridFilterModel, GridToolbar } from '@mui/x-data-grid';
import { useDemoData } from '@mui/x-data-grid-generator';

function AgentTable() {

    const VISIBLE_FIELDS = ['name', 'rating', 'country', 'dateCreated', 'isAdmin'];
    const { data } = useDemoData({
        dataSet: 'Employee',
        visibleFields: VISIBLE_FIELDS,
        rowLength: 100,
    });

    const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
        items: [
            {
                field: 'rating',
                operator: '>',
                value: '2.5',
            },
        ],
    });
    return (
        <div style={{  width: '100%', height:'90%' }}>
            <DataGrid
                {...data}
                slots={{
                    toolbar: GridToolbar,
                }}
                filterModel={filterModel}
                onFilterModelChange={(newFilterModel) => setFilterModel(newFilterModel)}
            />
        </div>
    )
}

export default AgentTable;