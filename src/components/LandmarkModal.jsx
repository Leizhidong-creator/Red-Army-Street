import { X } from 'lucide-react'
import { assetUrl } from '../data/landmarks'
import { ModelViewer } from './ModelViewer'

export function LandmarkModal({ landmark, onClose }) {
  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="landmark-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`landmark-title-${landmark.id}`}
        aria-label={landmark.name}
        style={{ '--modal-background': `url("${assetUrl('assets/modal-bg.png')}")` }}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="关闭旧址详情" title="关闭">
          <X aria-hidden="true" />
        </button>

        <div className="landmark-layout">
          <section className="model-region" aria-label={`${landmark.name}三维模型`}>
            <div className="model-region__meta" aria-hidden="true">
              <span>数字复原</span>
              <span>{landmark.index} / 05</span>
            </div>
            <ModelViewer modelUrl={assetUrl(landmark.model)} landmarkName={landmark.name} />
            <div className="model-region__caption" aria-hidden="true">
              <span className="caption-rule" />
              <span>{landmark.mapLabel}</span>
            </div>
          </section>

          <article className="story-region">
            <header className="story-header">
              <div className="story-header__index" aria-hidden="true">{landmark.index}</div>
              <p className="story-eyebrow">{landmark.eyebrow}</p>
              <h2 id={`landmark-title-${landmark.id}`}>{landmark.name}</h2>
            </header>

            <p className="story-lead">{landmark.lead}</p>

            <section className="story-copy">
              <div className="story-section-title">
                <span>旧址故事</span>
                <i aria-hidden="true" />
              </div>
              <p>{landmark.story}</p>
            </section>

            <dl className="story-facts">
              {landmark.facts.map((fact, index) => (
                <div key={fact}>
                  <dt>{String(index + 1).padStart(2, '0')}</dt>
                  <dd>{fact}</dd>
                </div>
              ))}
            </dl>

            <footer className="story-footer">
              <span>哈达铺红军长征旧址</span>
              <span aria-hidden="true">HADAPU · 1935</span>
            </footer>
          </article>
        </div>
      </section>
    </div>
  )
}
