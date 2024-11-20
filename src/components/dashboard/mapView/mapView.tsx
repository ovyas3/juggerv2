
'use client'
import Placeholder from '@/components/MapView/Skeleton/placeholder'
import dynamic from 'next/dynamic'

const TripTrackerDynamic = dynamic(() => import('../../MapView/AllMap'), {
  loading: () => <Placeholder />,
  ssr: false
})

const MapView = () => {
  return (
      <TripTrackerDynamic />
  )
}

export default MapView;