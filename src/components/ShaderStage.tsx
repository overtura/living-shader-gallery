import { Float, Html, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import {
  Component,
  type ComponentRef,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import * as THREE from 'three'
import type { Scene, SceneForm } from '../scenes'
import type { ShaderTuning } from '../shader-tuning'

type ShaderCoreProps = {
  scene: Scene
  tuning: ShaderTuning
  isPlaying: boolean
  isWireframe: boolean
}

type ShaderStageProps = ShaderCoreProps & {
  previewMode: PreviewMode | null
  resetRevision: number
  onCanvasError: () => void
}

type PreviewMode = 'manual' | 'unsupported' | 'error'

type CanvasErrorBoundaryProps = {
  children: ReactNode
  fallback: ReactNode
  onError: () => void
}

class CanvasErrorBoundary extends Component<CanvasErrorBoundaryProps, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

type CameraRigProps = {
  controlsRef: RefObject<ComponentRef<typeof OrbitControls> | null>
  resetRevision: number
}

const INITIAL_CAMERA = {
  position: [0, 0, 5] as [number, number, number],
  fov: 45,
}
const CANVAS_PIXEL_RATIO: [number, number] = [1, 1.75]
const CANVAS_BACKGROUND: [string] = ['#f7fbff']

function CoreGeometry({ form }: { form: SceneForm }) {
  switch (form) {
    case 'dodecahedron':
      return <dodecahedronGeometry args={[1.62, 3]} />
    case 'torusKnot':
      return <torusKnotGeometry args={[1.08, 0.34, 180, 18]} />
    case 'torus':
      return <torusGeometry args={[1.2, 0.36, 96, 18]} />
    default:
      return <icosahedronGeometry args={[1.7, 48]} />
  }
}

function CameraRig({ controlsRef, resetRevision }: CameraRigProps) {
  const { camera, size } = useThree()

  useEffect(() => {
    camera.position.set(0, 0, size.width <= 560 ? 6.1 : 5)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    controlsRef.current?.target.set(0, 0, 0)
    controlsRef.current?.update()
    controlsRef.current?.saveState()
  }, [camera, controlsRef, resetRevision, size.width])

  return null
}

function ShaderCore({
  scene,
  tuning,
  isPlaying,
  isWireframe,
  onCanvasReady,
}: ShaderCoreProps & { onCanvasReady: () => void }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const groupRef = useRef<THREE.Group>(null)
  const elapsedTimeRef = useRef(0)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAccent: { value: new THREE.Color(scene.accent) },
      uSecondary: { value: new THREE.Color(scene.secondary) },
      uPulseSpeed: { value: tuning.pulseSpeed },
      uWarpStrength: { value: tuning.warpStrength },
    }),
    [scene.accent, scene.secondary, tuning.pulseSpeed, tuning.warpStrength],
  )

  useFrame((_, delta) => {
    if (isPlaying) elapsedTimeRef.current += delta
    const time = elapsedTimeRef.current

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time
      materialRef.current.uniforms.uAccent.value.set(scene.accent)
      materialRef.current.uniforms.uSecondary.value.set(scene.secondary)
      materialRef.current.uniforms.uPulseSpeed.value = tuning.pulseSpeed
      materialRef.current.uniforms.uWarpStrength.value = tuning.warpStrength
    }
    if (groupRef.current && isPlaying) {
      groupRef.current.rotation.y += delta * 0.18
      groupRef.current.rotation.x = Math.sin(time * 0.35) * 0.12
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={isPlaying ? 1.4 : 0} rotationIntensity={isPlaying ? 0.5 : 0} floatIntensity={isPlaying ? 0.8 : 0}>
        <mesh key={scene.form} onAfterRender={onCanvasReady}>
          <CoreGeometry form={scene.form} />
          <shaderMaterial
            ref={materialRef}
            uniforms={uniforms}
            wireframe={isWireframe}
            vertexShader={`
              varying vec3 vNormal;
              varying vec3 vPosition;
              uniform float uTime;
              uniform float uPulseSpeed;
              uniform float uWarpStrength;
              void main() {
                vNormal = normal;
                vPosition = position;
                float band = sin(position.y * 5.0 + uTime * uPulseSpeed);
                float diagonal = cos((position.x + position.z) * 3.2 - uTime * 0.8);
                vec3 warped = position + normal * (band * 0.78 + diagonal * 0.22) * uWarpStrength;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(warped, 1.0);
              }
            `}
            fragmentShader={`
              varying vec3 vNormal;
              varying vec3 vPosition;
              uniform float uTime;
              uniform vec3 uAccent;
              uniform vec3 uSecondary;
              uniform float uPulseSpeed;
              void main() {
                float rim = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.0);
                float pulse = 0.55 + 0.45 * sin(uTime * uPulseSpeed + vPosition.y * 4.0);
                float prism = smoothstep(0.58, 1.0, 0.5 + 0.5 * sin((vPosition.x - vPosition.z) * 4.5 + uTime));
                vec3 porcelain = vec3(0.70, 0.86, 0.92);
                vec3 color = mix(porcelain, uAccent, clamp(rim * 0.72 + pulse * 0.28, 0.0, 1.0));
                color = mix(color, uSecondary, prism * 0.24);
                gl_FragColor = vec4(color, 1.0);
              }
            `}
          />
        </mesh>
      </Float>
      <Html position={[0, -1.82, 0]} center>
        <span className="scene-tag">{scene.name}</span>
      </Html>
    </group>
  )
}

function StaticShaderPreview({ scene, reason }: { scene: Scene; reason: PreviewMode }) {
  const isErrorFallback = reason === 'error'

  return (
    <div className="static-preview">
      <span className="static-preview-form" aria-hidden="true" />
      <div className="static-preview-copy">
        <span>{reason === 'unsupported' ? 'WebGL 대체 화면' : isErrorFallback ? '3D 오류 대체 화면' : '정적 보기'}</span>
        <strong>{scene.name}</strong>
        <p>
          {reason === 'unsupported'
            ? '이 환경에서는 3D 캔버스 대신 장면의 팔레트와 형태를 보여드려요.'
            : isErrorFallback
              ? '3D 장면을 표시하지 못해 장면의 팔레트와 형태를 대신 보여드려요.'
            : 'WebGL을 잠시 쉬고 장면의 팔레트와 형태를 가볍게 확인하고 있어요.'}
        </p>
        <small>
          {scene.palette} · {scene.motion}
        </small>
      </div>
    </div>
  )
}

function CanvasFailureMonitor({ onCanvasError }: { onCanvasError: () => void }) {
  const gl = useThree((state) => state.gl)

  useEffect(() => {
    const canvas = gl.domElement
    const handleContextLost = (event: Event) => {
      event.preventDefault()
      onCanvasError()
    }

    canvas.addEventListener('webglcontextlost', handleContextLost)
    return () => canvas.removeEventListener('webglcontextlost', handleContextLost)
  }, [gl, onCanvasError])

  return null
}

export function ShaderStage({
  scene,
  tuning,
  isPlaying,
  isWireframe,
  previewMode,
  resetRevision,
  onCanvasError,
}: ShaderStageProps) {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null)
  const canvasReadyRef = useRef(false)
  const initializationTimeoutRef = useRef<number | null>(null)
  const handleCanvasReady = useCallback(() => {
    if (canvasReadyRef.current) return
    canvasReadyRef.current = true
    if (initializationTimeoutRef.current !== null) {
      window.clearTimeout(initializationTimeoutRef.current)
      initializationTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    if (previewMode) {
      canvasReadyRef.current = false
      return
    }
    if (canvasReadyRef.current) return

    initializationTimeoutRef.current = window.setTimeout(onCanvasError, 5000)
    return () => {
      if (initializationTimeoutRef.current !== null) {
        window.clearTimeout(initializationTimeoutRef.current)
        initializationTimeoutRef.current = null
      }
    }
  }, [onCanvasError, previewMode])

  if (previewMode) {
    return <StaticShaderPreview scene={scene} reason={previewMode} />
  }

  return (
    <CanvasErrorBoundary fallback={<StaticShaderPreview scene={scene} reason="error" />} onError={onCanvasError}>
      <Canvas camera={INITIAL_CAMERA} dpr={CANVAS_PIXEL_RATIO}>
        <color attach="background" args={CANVAS_BACKGROUND} />
        <ambientLight intensity={0.95} />
        <directionalLight position={[4, 6, 5]} intensity={2.4} color="#ffffff" />
        <pointLight position={[3, 4, 5]} intensity={scene.lightPower} color={scene.accent} />
        <pointLight position={[-3, -2, 4]} intensity={5} color={scene.secondary} />
        <ShaderCore
          scene={scene}
          tuning={tuning}
          isPlaying={isPlaying}
          isWireframe={isWireframe}
          onCanvasReady={handleCanvasReady}
        />
        <OrbitControls ref={controlsRef} enablePan={false} minDistance={3.5} maxDistance={7} />
        <CameraRig controlsRef={controlsRef} resetRevision={resetRevision} />
        <CanvasFailureMonitor onCanvasError={onCanvasError} />
        <EffectComposer>
          <Bloom intensity={tuning.bloom} luminanceThreshold={0.32} luminanceSmoothing={0.28} />
          <Vignette eskil={false} offset={0.46} darkness={0.12} />
        </EffectComposer>
      </Canvas>
    </CanvasErrorBoundary>
  )
}
