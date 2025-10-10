# Juggernaut Style Guide

> Comprehensive guide for developing features in the Juggernaut Next.js dashboard project

---

## Related Documentation

📘 **[Design System](./DESIGN_SYSTEM.md)** - Color palette, typography, spacing, shadows, and visual design standards

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Guidelines](#component-guidelines)
3. [Data Fetching Patterns](#data-fetching-patterns)
4. [Styling Guide](#styling-guide)
5. [TypeScript Guide](#typescript-guide)
6. [Helper Functions Guide](#helper-functions-guide)
7. [Common Patterns](#common-patterns)
8. [Performance Best Practices](#performance-best-practices)
9. [Authentication & Authorization](#authentication--authorization)
10. [Examples](#examples)

---

## Architecture Overview

### Next.js App Router Structure

```
juggernaut/
├── src/
│   ├── app/                    # All routes (App Router)
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── globals.css        # Global styles & CSS variables
│   │   ├── page.tsx           # Home page
│   │   ├── triptracker/       # Feature route
│   │   │   └── page.tsx
│   │   ├── inplant-dashboard/
│   │   └── ...
│   ├── components/            # Reusable components by feature
│   │   ├── UI/               # Generic UI components
│   │   ├── Header/           # App header
│   │   ├── Drawer/           # Navigation
│   │   ├── InPlantDashboard/ # Feature components
│   │   └── ...
│   ├── utils/                # Utility functions
│   ├── services/             # Service layer (API, Auth)
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Library utilities
│   ├── assets/               # Static images, icons
│   └── environments/         # Environment configs
```

### Key Architecture Decisions

1. **All Components are Client Components**
   - Every component uses `"use client"` directive
   - No Server Components in this project
   - Heavy reliance on client-side state and browser APIs

2. **Multiple UI Libraries**
   - Material-UI (primary): Layout, forms, data display
   - Ant Design: Tables, advanced UI components
   - Radix UI + shadcn/ui: Modern accessible primitives
   - Custom components in `components/UI/`

3. **Hybrid Styling**
   - CSS Modules for component styles (primary)
   - Tailwind utilities for spacing/layout (secondary)
   - MUI's `sx` prop for dynamic styles
   - Global CSS variables in `globals.css`

4. **Data Flow**
   ```
   Component → utils/Communication → Axios → External API
                     ↓
              services/Authenticator (auth headers)
                     ↓
              Error handling (401 → redirect to login)
   ```

---

## Component Guidelines

### Client Component Template

**File**: `src/components/[Feature]/ComponentName.tsx`

```typescript
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import styles from "./ComponentName.module.css"
import { httpsGet } from "@/utils/Communication"
import { useSnackbar } from "@/hooks/snackBar"

interface ComponentNameProps {
  title: string
  data?: any[]
  onUpdate?: (data: any) => void
  isLoading?: boolean
}

const ComponentName: React.FC<ComponentNameProps> = ({
  title,
  data = [],
  onUpdate,
  isLoading = false
}) => {
  const router = useRouter()
  const { showMessage } = useSnackbar()
  const [localState, setLocalState] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await httpsGet("api/endpoint", 0, router)
      if (response?.data) {
        setLocalState(response.data)
        onUpdate?.(response.data)
      }
    } catch (error) {
      showMessage("Failed to fetch data", "error")
      console.error(error)
    }
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.content}>
        {localState.map((item, index) => (
          <div key={item._id || index} className={styles.item}>
            {item.name}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ComponentName
```

**Corresponding CSS Module**: `ComponentName.module.css`

```css
.container {
  padding: 24px;
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item {
  padding: 12px;
  background-color: var(--background-color);
  border-radius: 4px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-secondary);
}
```

### Page Component Template

**File**: `src/app/feature-name/page.tsx`

```typescript
"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import FeatureComponent from "@/components/Feature/FeatureComponent"
import Header from "@/components/Header/header"

function FeatureContent() {
  const searchParams = useSearchParams()
  const [data, setData] = useState(null)
  const id = searchParams.get("id")

  useEffect(() => {
    if (id) {
      // Fetch data based on id
    }
  }, [id])

  return (
    <div>
      <FeatureComponent data={data} />
    </div>
  )
}

export default function FeaturePage() {
  return (
    <div>
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <FeatureContent />
      </Suspense>
    </div>
  )
}
```

### UI Component Template (Reusable)

**File**: `src/components/UI/CustomCard.tsx`

```typescript
"use client"

import React from "react"
import styles from "./CustomCard.module.css"
import { cn } from "@/lib/utils"

interface CustomCardProps {
  title: string
  children: React.ReactNode
  className?: string
  variant?: "default" | "elevated" | "outlined"
  onClick?: () => void
}

const CustomCard: React.FC<CustomCardProps> = ({
  title,
  children,
  className,
  variant = "default",
  onClick
}) => {
  return (
    <div
      className={cn(
        styles.card,
        styles[variant],
        onClick && styles.clickable,
        className
      )}
      onClick={onClick}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  )
}

export default CustomCard
```

---

## Data Fetching Patterns

### HTTP Client Usage

All API calls use the custom HTTP utilities from `@/utils/Communication`.

#### GET Request Pattern

```typescript
import { httpsGet } from "@/utils/Communication"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

const useDataFetch = (endpoint: string, type: number = 0) => {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await httpsGet(endpoint, type, router)
        setData(response?.data || response)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [endpoint, type])

  return { data, loading, error }
}

// Usage
const { data, loading, error } = useDataFetch("shipments/list", 0)
```

#### POST Request Pattern

```typescript
import { httpsPost } from "@/utils/Communication"
import { useRouter } from "next/navigation"
import { useSnackbar } from "@/hooks/snackBar"

const Component = () => {
  const router = useRouter()
  const { showMessage } = useSnackbar()

  const handleSubmit = async (formData: any) => {
    try {
      const response = await httpsPost(
        "shipments/create",
        formData,
        router,
        0  // API type index (0-3)
      )

      if (response?.success) {
        showMessage("Created successfully", "success")
      } else {
        showMessage(response?.message || "Failed to create", "error")
      }
    } catch (error) {
      showMessage("An error occurred", "error")
      console.error(error)
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      handleSubmit(formData)
    }}>
      {/* Form fields */}
    </form>
  )
}
```

#### PUT Request Pattern

```typescript
import { httpsPut } from "@/utils/Communication"

const updateRecord = async (id: string, updates: any) => {
  const router = useRouter()

  const response = await httpsPut(
    `records/${id}`,
    updates,
    router,
    0
  )

  return response
}
```

#### File Upload Pattern

```typescript
import { httpsPost } from "@/utils/Communication"

const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("metadata", JSON.stringify({ name: file.name }))

  const response = await httpsPost(
    "upload/file",
    formData,
    router,
    0,
    true  // isFile = true
  )

  return response
}
```

### API Type Selection

The `type` parameter in HTTP utilities selects the base URL:

```typescript
// From environments/env.api.ts
const prefix = [
  environment.API_URL,             // type = 0
  environment.API_URL_DASHBOARD,   // type = 1
  environment.API_URL_DASHBOARD2,  // type = 2
  environment.API_URL_DASHBOARD3,  // type = 3
]
```

**Usage**:
```typescript
// Main API
await httpsGet("endpoint", 0, router)

// Dashboard API
await httpsGet("dashboard/stats", 1, router)
```

---

## Styling Guide

### CSS Modules (Primary Method)

**Component**: `MetricCard.tsx`
```typescript
import styles from "./MetricCard.module.css"

const MetricCard = ({ title, value }) => (
  <div className={styles.card}>
    <h3 className={styles.title}>{title}</h3>
    <p className={styles.value}>{value}</p>
  </div>
)
```

**CSS Module**: `MetricCard.module.css`
```css
.card {
  background-color: var(--card-background);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}
```

### Global CSS Variables

Use variables defined in `src/app/globals.css`:

```css
/* Available global variables */
:root {
  --primary-color: #2a9d8f;
  --secondary-color: #e76f51;
  --tertiary-color: #264653;
  --background-color: #f8f9fa;
  --card-background: #ffffff;
  --text-primary: #1a1a1a;
  --text-secondary: #6c757d;
  --border-color: #e9ecef;
}

/* Usage in CSS Modules */
.container {
  background-color: var(--background-color);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

### Tailwind Utilities (Secondary)

Used primarily with shadcn/ui components and for quick utility classes:

```typescript
import { cn } from "@/lib/utils"

const Component = ({ className }) => (
  <div className={cn("flex items-center gap-4 p-4", className)}>
    <div className="flex-1">Content</div>
    <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
      Action
    </button>
  </div>
)
```

### Material-UI Styling

**Inline `sx` prop for dynamic styles**:
```typescript
import { Box, Typography } from "@mui/material"

const Component = ({ color }) => (
  <Box
    sx={{
      padding: 2,
      backgroundColor: color || "primary.main",
      borderRadius: 1,
      "&:hover": {
        backgroundColor: "primary.dark"
      }
    }}
  >
    <Typography variant="h6" sx={{ color: "white" }}>
      Title
    </Typography>
  </Box>
)
```

**Using MUI components**:
```typescript
import { Container, Grid, Card, CardContent } from "@mui/material"

const Dashboard = () => (
  <Container maxWidth="xl">
    <Grid container spacing={3}>
      <Grid item xs={12} md={6} lg={4}>
        <Card>
          <CardContent>
            {/* Content */}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Container>
)
```

### Responsive Design

**Using MUI breakpoints**:
```typescript
import { useMediaQuery, useTheme } from "@mui/material"

const Component = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.down("md"))

  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  )
}
```

**CSS Module media queries**:
```css
.container {
  padding: 24px;
}

@media (max-width: 768px) {
  .container {
    padding: 16px;
  }
}
```

---

## TypeScript Guide

### Props Type Definition

**Basic Props**:
```typescript
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: "primary" | "secondary" | "outline"
  size?: "sm" | "md" | "lg"
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled = false,
  variant = "primary",
  size = "md"
}) => {
  // Component implementation
}
```

**Props with Children**:
```typescript
interface CardProps {
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  footer,
  className
}) => {
  // Implementation
}
```

**Extending HTML Elements**:
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  ...props
}) => (
  <div>
    <label>{label}</label>
    <input className={className} {...props} />
    {error && <span className="error">{error}</span>}
  </div>
)
```

### API Response Types

**Define in `utils/interface.ts`**:
```typescript
export interface ShipmentResponse {
  _id: string
  fnr: {
    primary: string
    unique_code: string
  }
  destination: {
    name: string
    code: string
  }
  status: {
    name: string
    code: string
  }
  pickup_date: string
  eta: string
  no_of_wagons: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}
```

**Usage**:
```typescript
import { httpsGet } from "@/utils/Communication"
import type { ShipmentResponse, ApiResponse } from "@/utils/interface"

const fetchShipments = async (): Promise<ShipmentResponse[]> => {
  const response = await httpsGet("shipments", 0, router)
  return response?.data || []
}
```

### State Types

```typescript
const [user, setUser] = useState<User | null>(null)
const [shipments, setShipments] = useState<ShipmentResponse[]>([])
const [loading, setLoading] = useState<boolean>(false)
const [filters, setFilters] = useState<{
  status: string
  from: string
  to: string
}>({
  status: "",
  from: "",
  to: ""
})
```

### Event Handler Types

```typescript
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setInputValue(event.target.value)
}

const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  // Submit logic
}

const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  console.log("Clicked at", event.clientX, event.clientY)
}
```

---

## Helper Functions Guide

### Date & Time Utilities

**Using `dateUtils.ts` (dayjs-based)**:
```typescript
import { formatDate, toUTCString, generateDateRange } from "@/utils/dateUtils"

// Format a date
const formatted = formatDate("2024-10-10", "YYYY-MM-DD HH:mm")
// Output: "2024-10-10 00:00"

// Convert to UTC ISO string
const utcString = toUTCString("2024-10-10", true)
// Output: "2024-10-10T00:00:00.000Z"

// Generate date range
const dates = generateDateRange("2024-10-01", 7)
// Output: ["2024-10-01", "2024-10-02", ..., "2024-10-07"]
```

**Using `timeService.ts` (luxon-based)**:
```typescript
import timeService from "@/utils/timeService"

// Convert UTC to IST
const istDate = timeService.utcToist("2024-10-10T10:00:00Z", "dd-MMM-yy")
// Output: "10-Oct-24"

const istTime = timeService.getTimeWithAMPM("2024-10-10T10:00:00Z")
// Output: "03:30 PM" (IST)

// Time difference
const hoursDiff = timeService.diffrent(
  "2024-10-10T10:00:00Z",
  "2024-10-10T14:00:00Z",
  "hours"
)
// Output: -4

// Convert milliseconds to HH:MM
const duration = timeService.convertMsToHM(7200000) // 2 hours
// Output: "02:00"
```

### Storage Utilities

**Cookie Management**:
```typescript
import { getCookie, setCookies, hasCookie, deleteCookie } from "@/utils/storageService"

// Set a cookie
setCookies("user_preference", "dark_mode", { expires: 30 }) // 30 days

// Get a cookie
const preference = getCookie("user_preference")

// Check if cookie exists
if (hasCookie("access_token")) {
  // User is authenticated
}

// Delete a cookie
deleteCookie("temp_data")
```

**LocalStorage Patterns**:
```typescript
// Store complex data
localStorage.setItem("user_settings", JSON.stringify({
  theme: "dark",
  language: "en"
}))

// Retrieve complex data
const settings = JSON.parse(localStorage.getItem("user_settings") || "{}")

// Always provide fallback for null values
const shippers = JSON.parse(localStorage.getItem("shippers") || "[]")
```

### Export Utilities

**JSON to CSV**:
```typescript
import { jsontocsv } from "@/utils/jsonToCsv"

const exportShipments = (shipments: any[]) => {
  const headers = [
    "fnr",
    "destination",
    "status",
    "pickup_date",
    "eta"
  ]

  const data = shipments.map(s => ({
    fnr: s.fnr.primary,
    destination: s.destination.name,
    status: s.status.name,
    pickup_date: s.pickup_date,
    eta: s.eta
  }))

  jsontocsv(data, "shipments_export", headers)
}
```

### Class Name Utilities

**Merging Tailwind Classes**:
```typescript
import { cn } from "@/lib/utils"

// Merge classes with conflict resolution
const buttonClass = cn(
  "px-4 py-2 rounded",
  isActive && "bg-blue-500 text-white",
  isDisabled && "opacity-50 cursor-not-allowed",
  className
)

// In components
<button className={cn(styles.button, "hover:bg-gray-100", className)}>
  Click me
</button>
```

---

## Common Patterns

### Snackbar Notifications

```typescript
import { useSnackbar } from "@/hooks/snackBar"

const Component = () => {
  const { showMessage } = useSnackbar()

  const handleSuccess = () => {
    showMessage("Operation completed successfully!", "success")
  }

  const handleError = (errorMsg: string) => {
    showMessage(errorMsg, "error", 5000) // Show for 5 seconds
  }

  const handleInfo = () => {
    showMessage("Processing your request...", "info")
  }

  const handleWarning = () => {
    showMessage("Please review your input", "warning")
  }

  return (
    <div>
      {/* Component UI */}
    </div>
  )
}
```

### Loading States

**Component-level loading**:
```typescript
const Component = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await httpsGet("endpoint", 0, router)
        setData(response?.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <CircularProgress />
        <p>Loading data...</p>
      </div>
    )
  }

  return <div>{/* Render data */}</div>
}
```

**Skeleton loading (MUI)**:
```typescript
import { Skeleton } from "@mui/material"

const LoadingSkeleton = () => (
  <div>
    <Skeleton variant="text" width={200} height={30} />
    <Skeleton variant="rectangular" width="100%" height={200} />
    <Skeleton variant="text" width="80%" height={20} />
  </div>
)

const Component = () => {
  const [loading, setLoading] = useState(true)

  return loading ? <LoadingSkeleton /> : <ActualContent />
}
```

### Error Handling

```typescript
const Component = () => {
  const [error, setError] = useState<string | null>(null)
  const { showMessage } = useSnackbar()

  const fetchData = async () => {
    try {
      const response = await httpsGet("endpoint", 0, router)
      if (!response?.success) {
        throw new Error(response?.message || "Failed to fetch data")
      }
      setData(response.data)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      showMessage(errorMessage, "error")
    }
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Error: {error}</p>
        <button onClick={fetchData}>Retry</button>
      </div>
    )
  }

  return <div>{/* Normal content */}</div>
}
```

### Pagination Pattern

```typescript
const PaginatedList = () => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchData(page, rowsPerPage)
  }, [page, rowsPerPage])

  const fetchData = async (skip: number, limit: number) => {
    const response = await httpsPost("endpoint", {
      skip,
      limit
    }, router, 0)

    setData(response?.data || [])
    setTotal(response?.total || 0)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <div>
      {/* Table content */}
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  )
}
```

### Modal Pattern

```typescript
import { Dialog, DialogContent, DialogTitle } from "@mui/material"

const Component = () => {
  const [open, setOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const handleOpen = (item: any) => {
    setSelectedItem(item)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedItem(null)
  }

  return (
    <div>
      <button onClick={() => handleOpen(data)}>Open Modal</button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Item Details</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <div>
              {/* Modal content */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

---

## Performance Best Practices

### Dynamic Imports

For heavy components (maps, charts, large libraries):

```typescript
import dynamic from 'next/dynamic'

// Disable SSR for client-heavy components
const KeplerMap = dynamic(
  () => import('@/components/triptracker/map/Kepler-map'),
  { ssr: false, loading: () => <div>Loading map...</div> }
)

const EChartsComponent = dynamic(
  () => import('echarts-for-react'),
  { ssr: false }
)

const Component = () => (
  <div>
    <KeplerMap data={mapData} />
    <EChartsComponent option={chartOptions} />
  </div>
)
```

### Memoization

**Memoize expensive calculations**:
```typescript
import { useMemo } from "react"

const DataTable = ({ data }) => {
  const processedData = useMemo(() => {
    return data
      .filter(item => item.status === "active")
      .map(item => ({
        ...item,
        displayName: `${item.fnr} - ${item.destination}`
      }))
      .sort((a, b) => a.pickup_date.localeCompare(b.pickup_date))
  }, [data])

  return (
    <table>
      {processedData.map(row => (
        <tr key={row._id}>{/* Row content */}</tr>
      ))}
    </table>
  )
}
```

**Memoize callback functions**:
```typescript
import { useCallback } from "react"

const Parent = () => {
  const [count, setCount] = useState(0)

  const handleChildUpdate = useCallback((data: any) => {
    // This function won't be recreated on every render
    console.log("Child updated:", data)
  }, []) // Empty deps = never recreate

  return <Child onUpdate={handleChildUpdate} />
}
```

### Image Optimization

```typescript
import Image from "next/image"

const Component = () => (
  <div>
    {/* Optimized image with priority loading */}
    <Image
      src="/logo.png"
      alt="Company Logo"
      width={200}
      height={50}
      priority
    />

    {/* Remote image (domain must be in next.config.mjs) */}
    <Image
      src="https://wagon-tally-sheet.s3.ap-south-1.amazonaws.com/image.jpg"
      alt="Remote image"
      width={400}
      height={300}
      loading="lazy"
    />

    {/* Fill container */}
    <div style={{ position: "relative", width: "100%", height: "400px" }}>
      <Image
        src="/banner.jpg"
        alt="Banner"
        fill
        style={{ objectFit: "cover" }}
      />
    </div>
  </div>
)
```

### Code Splitting by Route

Next.js automatically code-splits by route, but you can optimize further:

```typescript
// app/dashboard/page.tsx
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/Charts/HeavyChart'))
const DataTable = dynamic(() => import('@/components/Tables/DataTable'))

export default function Dashboard() {
  return (
    <div>
      <HeavyChart />
      <DataTable />
    </div>
  )
}
```

---

## Authentication & Authorization

### Authentication Flow

```typescript
// services/Authenticator/Auth.ts
import { httpsPost } from "@/utils/Communication"
import { setCookies, getCookie } from "@/utils/storageService"

const authenticate = async (data: any) => {
  const { access_token_web, default_unit, shippers, name, roles } = data

  localStorage.setItem("user_name", name)
  localStorage.setItem("roles", JSON.stringify(roles))
  setCookies("access_token", access_token_web)
  setCookies("default_unit", default_unit)

  // Handle corporate vs regular users
  if (data.corporate_shippers?.length > 0) {
    setCookies("is_corporate_user", "true")
    localStorage.setItem(
      "corporate_shipper",
      JSON.stringify(data.corporate_shippers)
    )
  } else {
    setCookies("is_corporate_user", "false")
    localStorage.setItem("shippers", JSON.stringify(shippers))
  }
}

export const handleAuthentication = async (from: string, auth: string) => {
  if (from === "tms_sd" && auth) {
    const response = await httpsPost("dashboard/auth", { auth }, {}, 1)
    if (response) {
      authenticate(response.data)
      return true
    }
  }
  return false
}

export const getAuth = () => {
  const token = getCookie("access_token")
  const shipper = getCookie("shipper_id")
  return `bearer ${token} shipper ${shipper}`
}
```

### Checking Authentication

```typescript
import { getCookie, hasCookie } from "@/utils/storageService"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const ProtectedPage = () => {
  const router = useRouter()

  useEffect(() => {
    if (!hasCookie("access_token")) {
      router.push("/signin")
    }
  }, [router])

  const isCorporateUser = getCookie("is_corporate_user") === "true"

  return (
    <div>
      {isCorporateUser ? <CorporateView /> : <RegularView />}
    </div>
  )
}
```

### Role-Based Access

```typescript
const Component = () => {
  const [userRoles, setUserRoles] = useState<string[]>([])

  useEffect(() => {
    const roles = JSON.parse(localStorage.getItem("roles") || "[]")
    setUserRoles(roles)
  }, [])

  const hasRole = (role: string) => userRoles.includes(role)

  return (
    <div>
      {hasRole("admin") && <AdminPanel />}
      {hasRole("viewer") && <ViewOnlyContent />}
      {hasRole("editor") && <EditControls />}
    </div>
  )
}
```

---

## Examples

### Complete Feature Example: Trip Tracker

**Route**: `src/app/triptracker/page.tsx`
```typescript
"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Triptracker from "@/components/triptracker/triptracker"

function TriptrackerContent() {
  const sp = useSearchParams()
  const [uniqueCode, setUniqCode] = useState<string>(sp.get("unique_code") as string)

  useEffect(() => {
    const unCode = sp.get("unique_code")
    if (unCode) {
      setUniqCode(unCode)
    }
  }, [sp])

  return (
    <div>
      <Triptracker uniqueCode={uniqueCode} />
    </div>
  )
}

export default function TriptrackerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TriptrackerContent />
    </Suspense>
  )
}
```

**Component**: `src/components/triptracker/triptracker.tsx`
```typescript
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from 'next/dynamic'
import { httpsGet } from "@/utils/Communication"
import { useSnackbar } from "@/hooks/snackBar"
import Header from "@/components/Header/header"
import styles from "./triptracker.module.css"

const KeplerMap = dynamic(
  () => import('./map/Kepler-map'),
  { ssr: false, loading: () => <div>Loading map...</div> }
)

interface TriptrackerProps {
  uniqueCode: string
}

const Triptracker: React.FC<TriptrackerProps> = ({ uniqueCode }) => {
  const router = useRouter()
  const { showMessage } = useSnackbar()
  const [tripData, setTripData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (uniqueCode) {
      fetchTripData()
    }
  }, [uniqueCode])

  const fetchTripData = async () => {
    try {
      setLoading(true)
      const response = await httpsGet(
        `trips/${uniqueCode}`,
        0,
        router
      )

      if (response?.data) {
        setTripData(response.data)
      } else {
        showMessage("Trip not found", "error")
      }
    } catch (error) {
      showMessage("Failed to load trip data", "error")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading trip tracker...</p>
      </div>
    )
  }

  if (!tripData) {
    return (
      <div className={styles.error}>
        <p>Trip data not available</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <div className={styles.mapContainer}>
          <KeplerMap tripData={tripData} />
        </div>
      </div>
    </div>
  )
}

export default Triptracker
```

### Dashboard Metrics Card Example

```typescript
"use client"

import React from "react"
import styles from "./MetricCard.module.css"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

type MetricCardProps = {
  title: string
  value: string
  trend?: "up" | "down" | "neutral"
  trendValue?: number
  icon: React.ReactNode
  iconColor?: string
  bgColor?: string
  borderColor?: string
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend = "neutral",
  trendValue = 0,
  icon,
  iconColor,
  bgColor,
  borderColor,
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <ArrowUpRight className={styles.trendIconUp} />
      case "down":
        return <ArrowDownRight className={styles.trendIconDown} />
      default:
        return <Minus className={styles.trendIconNeutral} />
    }
  }

  return (
    <div
      className={styles.metricCard}
      style={{
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
      }}
    >
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <div className={styles.icon} style={{ color: iconColor }}>
            {icon}
          </div>
          <span style={{ color: iconColor }} className={styles.title}>
            {title}
          </span>
        </div>
        <div style={{ color: iconColor }} className={styles.value}>
          {value}
        </div>
      </div>
    </div>
  )
}

export default MetricCard
```

### Form with Validation Example

```typescript
"use client"

import { useState } from "react"
import { httpsPost } from "@/utils/Communication"
import { useSnackbar } from "@/hooks/snackBar"
import { useRouter } from "next/navigation"
import styles from "./CreateForm.module.css"

const CreateForm = () => {
  const router = useRouter()
  const { showMessage } = useSnackbar()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required"
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      showMessage("Please fix the errors", "error")
      return
    }

    setSubmitting(true)

    try {
      const response = await httpsPost(
        "users/create",
        formData,
        router,
        0
      )

      if (response?.success) {
        showMessage("User created successfully", "success")
        // Reset form
        setFormData({ name: "", email: "", phone: "" })
      } else {
        showMessage(response?.message || "Failed to create user", "error")
      }
    } catch (error) {
      showMessage("An error occurred", "error")
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? styles.inputError : ""}
        />
        {errors.name && <span className={styles.error}>{errors.name}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? styles.inputError : ""}
        />
        {errors.email && <span className={styles.error}>{errors.email}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={errors.phone ? styles.inputError : ""}
        />
        {errors.phone && <span className={styles.error}>{errors.phone}</span>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className={styles.submitButton}
      >
        {submitting ? "Creating..." : "Create User"}
      </button>
    </form>
  )
}

export default CreateForm
```

---

## Quick Reference

### Essential Imports

```typescript
// Client directive
"use client"

// React
import React, { useState, useEffect, useMemo, useCallback } from "react"

// Next.js
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Image from "next/image"
import dynamic from "next/dynamic"

// Utils
import { httpsGet, httpsPost, httpsPut } from "@/utils/Communication"
import { getCookie, setCookies } from "@/utils/storageService"
import { formatDate } from "@/utils/dateUtils"
import timeService from "@/utils/timeService"
import { cn } from "@/lib/utils"

// Hooks
import { useSnackbar } from "@/hooks/snackBar"

// MUI
import { Box, Grid, Container, useMediaQuery, useTheme } from "@mui/material"

// Styles
import styles from "./Component.module.css"
```

### Common Component Structure

```typescript
"use client"

import React, { useState, useEffect } from "react"
import styles from "./Component.module.css"

interface ComponentProps {
  // Props definition
}

const Component: React.FC<ComponentProps> = (props) => {
  // State
  const [state, setState] = useState(null)

  // Effects
  useEffect(() => {
    // Side effects
  }, [])

  // Handlers
  const handleAction = () => {
    // Logic
  }

  // Render
  return (
    <div className={styles.container}>
      {/* JSX */}
    </div>
  )
}

export default Component
```

---

**For questions or clarifications, refer to existing code patterns in the codebase or the `.cursorrules` file.**
