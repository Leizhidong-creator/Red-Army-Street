import { MapPin } from 'lucide-react'
import { assetUrl, landmarks } from '../data/landmarks'

export function MapStage({ onSelect }) {
  return (
    <main className="map-stage">
      <h1 className="sr-only">哈达铺红军街 3D 互动地图</h1>
      <div className="map-scroll">
        <div className="map-frame">
          <img
            className="map-image"
            src={assetUrl('assets/map.jpg')}
            alt="哈达铺红军街空间故事线地图"
            draggable="false"
          />
          <div className="map-depth" aria-hidden="true" />
          {landmarks.map((landmark) => (
            <button
              className="hotspot"
              type="button"
              key={landmark.id}
              data-landmark-id={landmark.id}
              style={{ left: `${landmark.position.x}%`, top: `${landmark.position.y}%` }}
              aria-label={`查看${landmark.name}三维模型`}
              onClick={(event) => onSelect(landmark, event.currentTarget)}
            >
              <span className="hotspot__pulse" aria-hidden="true" />
              <span className="hotspot__pin" aria-hidden="true">
                <MapPin />
              </span>
              <span className="hotspot__label">
                <span>{landmark.name}</span>
                <small>数字旧址 {landmark.index}</small>
              </span>
            </button>
          ))}
          <div className="map-edition" aria-hidden="true">
            <span>数字旧址</span>
            <strong>05</strong>
          </div>
        </div>
      </div>
    </main>
  )
}
