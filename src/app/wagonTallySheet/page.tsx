
'use client'
import Placeholder from '@/components/MapView/Skeleton/placeholder'
import dynamic from 'next/dynamic'

const TripTrackerDynamic = dynamic(() => import('./wagonTallySheet'), {
  loading: () => <Placeholder />,
  ssr: false
})

const wagonTallySheet = () => {
  return (
      <TripTrackerDynamic />
  )
}

export default wagonTallySheet;