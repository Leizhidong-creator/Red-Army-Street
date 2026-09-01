import { useEffect, useRef, useState } from 'react'
import { LandmarkModal } from './components/LandmarkModal'
import { MapStage } from './components/MapStage'

export default function App() {
  const [selectedLandmark, setSelectedLandmark] = useState(null)
  const sourceButtonRef = useRef(null)

  const openLandmark = (landmark, sourceButton) => {
    sourceButtonRef.current = sourceButton
    setSelectedLandmark(landmark)
  }

  const closeLandmark = () => {
    sourceButtonRef.current?.focus()
    setSelectedLandmark(null)
  }

  useEffect(() => {
    if (!selectedLandmark) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeLandmark()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedLandmark])

  return (
    <>
      <MapStage onSelect={openLandmark} />
      {selectedLandmark && <LandmarkModal landmark={selectedLandmark} onClose={closeLandmark} />}
    </>
  )
}
