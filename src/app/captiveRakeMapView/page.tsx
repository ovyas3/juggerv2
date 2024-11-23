
'use client'
import Placeholder from '@/components/MapView/Skeleton/placeholder'
import dynamic from 'next/dynamic'

const CaptiveRakeMapViewDynamic = dynamic(() => import('./captiveRakeMapView'), {
  loading: () => <Placeholder />,
  ssr: false
})

const MapViewPage = () => {
  return (
      <CaptiveRakeMapViewDynamic />
  )
}

export default MapViewPage;