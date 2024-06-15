
'use client'
import dynamic from 'next/dynamic'

const TripTrackerDynamic = dynamic(() => import('../../components/MapView/AllMap'), {
  loading: () => <p>Loading...</p>,
  ssr: false
})

const MapViewPage = () => {
  return (
      <TripTrackerDynamic />
  )
}

export default MapViewPage;