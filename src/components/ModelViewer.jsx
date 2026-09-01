import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows, OrbitControls, useGLTF } from '@react-three/drei'
import { Maximize2, Minimize2, RotateCcw } from 'lucide-react'
import * as THREE from 'three'
import {
  HERITAGE_LIGHTING,
  prepareHeritageMaterial,
  prepareHeritageMesh,
} from '../three/lighting'
import { computePresentation, INITIAL_VIEW_DIRECTION } from '../three/modelFit'

class ModelErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidUpdate(previousProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      return this.props.fallback
    }
    return this.props.children
  }
}

function HeritageModel({ url, resetSignal, onReady, onInteracted, autoRotate }) {
  const controlsRef = useRef(null)
  const { camera, size: viewportSize } = useThree()
  const { scene } = useGLTF(url)

  const { object, bounds } = useMemo(() => {
    const clone = scene.clone(true)
    clone.updateMatrixWorld(true)
    const localBounds = new THREE.Box3().setFromObject(clone)

    clone.traverse((child) => {
      if (!child.isMesh) return
      child.castShadow = true
      child.receiveShadow = true
      if (child.material) {
        child.material = child.material.clone()
        prepareHeritageMaterial(child.material)
        prepareHeritageMesh(child)
      }
    })

    return { object: clone, bounds: localBounds }
  }, [scene])

  const presentation = useMemo(
    () =>
      computePresentation(bounds, {
        fovDegrees: camera.fov,
        aspect: Math.max(viewportSize.width / viewportSize.height, 0.2),
      }),
    [bounds, camera.fov, viewportSize.height, viewportSize.width],
  )

  useLayoutEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    const direction = new THREE.Vector3(
      INITIAL_VIEW_DIRECTION.x,
      INITIAL_VIEW_DIRECTION.y,
      INITIAL_VIEW_DIRECTION.z,
    ).normalize()
    const target = new THREE.Vector3(
      presentation.target.x,
      presentation.target.y,
      presentation.target.z,
    )
    camera.near = presentation.near
    camera.far = presentation.far
    camera.position.copy(target).addScaledVector(direction, presentation.distance)
    camera.updateProjectionMatrix()

    controls.target.copy(target)
    controls.minDistance = presentation.minDistance
    controls.maxDistance = presentation.maxDistance
    controls.update()
    controls.saveState()
    onReady()
  }, [camera, onReady, presentation, resetSignal])

  return (
    <>
      <primitive
        object={object}
        position={[presentation.offset.x, presentation.offset.y, presentation.offset.z]}
        dispose={null}
      />
      <ContactShadows
        position={[0, -0.004, 0]}
        opacity={0.36}
        scale={Math.max(presentation.radius * 4.6, 3)}
        blur={2.6}
        far={presentation.radius * 8}
        resolution={512}
        color="#2a0b08"
      />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.065}
        enablePan={false}
        minPolarAngle={Math.PI * 0.13}
        maxPolarAngle={Math.PI * 0.52}
        autoRotate={autoRotate}
        autoRotateSpeed={0.42}
        onStart={onInteracted}
      />
    </>
  )
}

function ModelScene({ url, resetSignal, onReady, onInteracted, autoRotate }) {
  return (
    <>
      <ambientLight intensity={HERITAGE_LIGHTING.ambientIntensity} color="#fff1dc" />
      <hemisphereLight
        intensity={HERITAGE_LIGHTING.hemisphereIntensity}
        color="#fff5df"
        groundColor="#8f5d4c"
      />
      <directionalLight
        castShadow
        intensity={HERITAGE_LIGHTING.keyIntensity}
        position={[2.5, 2.4, 6]}
        color="#fff0d6"
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <directionalLight
        intensity={HERITAGE_LIGHTING.fillIntensity}
        position={[-4, 3.5, -2]}
        color="#d9eee7"
      />
      <Suspense fallback={null}>
        <HeritageModel
          url={url}
          resetSignal={resetSignal}
          onReady={onReady}
          onInteracted={onInteracted}
          autoRotate={autoRotate}
        />
      </Suspense>
    </>
  )
}

export function ModelViewer({ modelUrl, landmarkName }) {
  const viewerRef = useRef(null)
  const [resetSignal, setResetSignal] = useState(0)
  const [ready, setReady] = useState(false)
  const [interacted, setInteracted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    setReady(false)
    setInteracted(false)
  }, [modelUrl])

  useEffect(() => {
    const handleFullscreen = () => setFullscreen(document.fullscreenElement === viewerRef.current)
    document.addEventListener('fullscreenchange', handleFullscreen)
    return () => document.removeEventListener('fullscreenchange', handleFullscreen)
  }, [])

  const resetView = () => {
    setInteracted(false)
    setResetSignal((value) => value + 1)
  }

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await viewerRef.current?.requestFullscreen?.()
    } else {
      await document.exitFullscreen?.()
    }
  }

  const errorFallback = (
    <div className="model-state model-state--error" role="alert">
      <strong>模型暂时无法载入</strong>
      <span>历史介绍仍可继续阅读。</span>
    </div>
  )

  return (
    <div
      className="model-viewer"
      ref={viewerRef}
      data-interacted={interacted ? 'true' : 'false'}
      onPointerDown={() => setInteracted(true)}
      onWheel={() => setInteracted(true)}
    >
      {!ready && (
        <div className="model-state" role="status">
          <span className="model-state__seal" aria-hidden="true" />
          <span>正在呈现 {landmarkName}</span>
        </div>
      )}
      <ModelErrorBoundary resetKey={modelUrl} fallback={errorFallback}>
        <Canvas
          className="model-canvas"
          dpr={[1, 1.75]}
          shadows
          camera={{ fov: 38, near: 0.01, far: 100, position: [2, 1.3, 2] }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0)
            gl.toneMappingExposure = HERITAGE_LIGHTING.exposure
          }}
        >
          <ModelScene
            url={modelUrl}
            resetSignal={resetSignal}
            onReady={() => setReady(true)}
            onInteracted={() => setInteracted(true)}
            autoRotate={!interacted}
          />
        </Canvas>
      </ModelErrorBoundary>
      <div className="viewer-tools" aria-label="三维模型工具">
        <button type="button" onClick={resetView} aria-label="重置模型视角" title="重置视角">
          <RotateCcw aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? '退出模型全屏' : '模型全屏'}
          title={fullscreen ? '退出全屏' : '全屏查看'}
        >
          {fullscreen ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
        </button>
      </div>
    </div>
  )
}
