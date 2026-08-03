import { Float, Html, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { MonitorOff } from 'lucide-react'
import {
  Component,
  type ComponentRef,
  type PropsWithChildren,
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import * as THREE from 'three'
import type { Scene, SceneForm } from '../scenes'
import type { ShaderTuning } from '../shader-tuning'
import { isWebGLAvailable } from '../webgl-support'

type ShaderCoreProps = {
  scene: Scene
  tuning: ShaderTuning
  isPlaying: boolean
  isWireframe: boolean
}

type ShaderStageProps = ShaderCoreProps & {
  isLowPower: boolean
  resetRevision: number
  onAvailabilityChange: (isAvailable: boolean) => void
}

type CameraRigProps = {
  controlsRef: RefObject<ComponentRef<typeof OrbitControls> | null>
  resetRevision: number
}

type ShaderStageErrorBoundaryProps = PropsWithChildren<{
  fallback: ReactNode
  onError: () => void
}>

type ShaderStageErrorBoundaryState = {
  hasError: boolean
}

const INITIAL_CAMERA = {
  position: [0, 0, 5] as [number, number, number],
  fov: 45,
}
const CANVAS_PIXEL_RATIO: [number, number] = [1, 1.75]
const CANVAS_BACKGROUND: [string] = ['#f7fbff']

class ShaderStageErrorBoundary extends Component<ShaderStageErrorBoundaryProps, ShaderStageErrorBoundaryState> {
  state: ShaderStageErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ShaderStageErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

function ShaderFallback({ scene }: { scene: Scene }) {
  return (
    <div className="shader-fallback" role="status">
      <div className="shader-fallback-preview" aria-hidden="true">
        <span />
      </div>
      <div className="shader-fallback-copy">
        <p className="eyebrow">정적 장면 프리뷰</p>
        <h3>3D 미리보기를 열 수 없어요</h3>
        <p>
          <strong>{scene.name}</strong>의 대표 색상입니다. 장면 정보와 조정값은 계속 살펴볼 수 있어요.
        </p>
        <span className="shader-fallback-hint">
          <MonitorOff size={15} aria-hidden="true" />
          하드웨어 가속 확인 후 새로고침
        </span>
      </div>
    </div>
  )
}

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

function ShaderCore({ scene, tuning, isPlaying, isWireframe }: ShaderCoreProps) {
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
        <mesh key={scene.form}>
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

export function ShaderStage({
  scene,
  tuning,
  isPlaying,
  isWireframe,
  isLowPower,
  resetRevision,
  onAvailabilityChange,
}: ShaderStageProps) {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null)
  const fallback = <ShaderFallback scene={scene} />

  if (!isWebGLAvailable()) return fallback

  return (
    <ShaderStageErrorBoundary fallback={fallback} onError={() => onAvailabilityChange(false)}>
      <Canvas
        camera={INITIAL_CAMERA}
        dpr={isLowPower ? 1 : CANVAS_PIXEL_RATIO}
        role="img"
        aria-label={`${scene.name} 3D 미리보기. ${isPlaying ? '모션 재생 중' : '모션 일시정지'}. ${isWireframe ? 'Wireframe 표시 중' : '표면 표시 중'}. ${isLowPower ? '저부하 렌더링 모드 사용 중' : '일반 렌더링 모드 사용 중'}.`}
        fallback={fallback}
      >
        <color attach="background" args={CANVAS_BACKGROUND} />
        <ambientLight intensity={0.95} />
        <directionalLight position={[4, 6, 5]} intensity={2.4} color="#ffffff" />
        <pointLight position={[3, 4, 5]} intensity={scene.lightPower} color={scene.accent} />
        <pointLight position={[-3, -2, 4]} intensity={5} color={scene.secondary} />
        <ShaderCore scene={scene} tuning={tuning} isPlaying={isPlaying} isWireframe={isWireframe} />
        <OrbitControls ref={controlsRef} enablePan={false} minDistance={3.5} maxDistance={7} />
        <CameraRig controlsRef={controlsRef} resetRevision={resetRevision} />
        {!isLowPower && (
          <EffectComposer>
            <Bloom intensity={tuning.bloom} luminanceThreshold={0.32} luminanceSmoothing={0.28} />
            <Vignette eskil={false} offset={0.46} darkness={0.12} />
          </EffectComposer>
        )}
      </Canvas>
    </ShaderStageErrorBoundary>
  )
}
