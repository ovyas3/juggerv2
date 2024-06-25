
'use client'
import Placeholder from '@/components/MapView/Skeleton/placeholder'
import dynamic from 'next/dynamic'

const TripTrackerDynamic = dynamic(() => import('../../components/MapView/AllMap'), {
  loading: () => <Placeholder />,
  ssr: false
})

const MapViewPage = () => {
  return (
      <TripTrackerDynamic />
  )
}

export default MapViewPage;