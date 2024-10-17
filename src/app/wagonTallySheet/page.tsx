
'use client'
import Placeholder from '@/components/MapView/Skeleton/placeholder'
import dynamic from 'next/dynamic'

const WagonTallySheetDynamic = dynamic(() => import('./wagonTallySheet'), {
  loading: () => <Placeholder />,
  ssr: false
})

const wagonTallySheet = () => {
  return (
      <WagonTallySheetDynamic />
  )
}

export default wagonTallySheet;