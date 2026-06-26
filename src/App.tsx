import { Float, Html, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { type CSSProperties, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

const INTENSITY_MIN = 0.7
const INTENSITY_MAX = 1.35
const INTENSITY_STEP = 0.05
const DEFAULT_INTENSITY = 1

const SCENES = [
  {
    id: 'aurora',
    name: '오로라 코어',
    summary: '시간에 따라 표면이 흔들리는 청록 스펙트럼 레이어',
    accent: '#007f9e',
    signal: '청록 림라이트',
    motion: '느린 파형 회전',
    postEffect: '얕은 bloom',
    warp: 0.09,
    rotationSpeed: 0.18,
    bloom: 0.38,
  },
  {
    id: 'ember',
    name: '엠버 필드',
    summary: '입자 굴절과 따뜻한 bloom을 실험하는 장면',
    accent: '#e66f2e',
    signal: '따뜻한 입자광',
    motion: '빠른 표면 맥동',
    postEffect: '강한 glow',
    warp: 0.12,
    rotationSpeed: 0.23,
    bloom: 0.48,
  },
  {
    id: 'violet',
    name: '바이올렛 페이즈',
    summary: '윤곽, 림라이트, 대비를 조정하는 장면',
    accent: '#6f57d8',
    signal: '보랏빛 윤곽선',
    motion: '절제된 위상 변화',
    postEffect: '대비 vignette',
    warp: 0.07,
    rotationSpeed: 0.14,
    bloom: 0.34,
  },
] as const

type Scene = (typeof SCENES)[number]
type SceneId = Scene['id']

const DEFAULT_SCENE = SCENES[0]

function getSceneById(sceneId: SceneId): Scene {
  return SCENES.find((scene) => scene.id === sceneId) ?? DEFAULT_SCENE
}

type SceneSelectorProps = {
  selectedSceneId: SceneId
  onSelectScene: (sceneId: SceneId) => void
}

function SceneSelector({ selectedSceneId, onSelectScene }: SceneSelectorProps) {
  return (
    <div className="actions" role="group" aria-label="장면 선택">
      {SCENES.map((scene) => (
        <button
          key={scene.id}
          type="button"
          className={scene.id === selectedSceneId ? 'active' : ''}
          aria-pressed={scene.id === selectedSceneId}
          onClick={() => onSelectScene(scene.id)}
        >
          {scene.name}
        </button>
      ))}
    </div>
  )
}

type SceneInspectorProps = {
  scene: Scene
  intensity: number
  onIntensityChange: (intensity: number) => void
}

function SceneInspector({ scene, intensity, onIntensityChange }: SceneInspectorProps) {
  const panelStyle = { '--scene-accent': scene.accent } as CSSProperties
  const intensityPercent = Math.round(intensity * 100)

  return (
    <div className="shader-panel" style={panelStyle}>
      <div className="intensity-head">
        <label htmlFor="shader-intensity">반응 강도</label>
        <output htmlFor="shader-intensity" aria-label="현재 반응 강도">
          {intensityPercent}%
        </output>
      </div>
      <input
        id="shader-intensity"
        className="intensity-slider"
        type="range"
        min={INTENSITY_MIN}
        max={INTENSITY_MAX}
        step={INTENSITY_STEP}
        value={intensity}
        aria-label={`${scene.name} 셰이더 반응 강도`}
        onChange={(event) => onIntensityChange(Number(event.currentTarget.value))}
      />
      <dl className="scene-signals" aria-label={`${scene.name} 장면 신호`}>
        <div>
          <dt>색 신호</dt>
          <dd>
            <span className="signal-swatch" aria-hidden="true" />
            {scene.signal}
          </dd>
        </div>
        <div>
          <dt>움직임</dt>
          <dd>{scene.motion}</dd>
        </div>
        <div>
          <dt>후처리</dt>
          <dd>{scene.postEffect}</dd>
        </div>
      </dl>
    </div>
  )
}

function ShaderCore({ scene, intensity }: { scene: Scene; intensity: number }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const groupRef = useRef<THREE.Group>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAccent: { value: new THREE.Color(scene.accent) },
      uWarp: { value: scene.warp * intensity },
    }),
    [intensity, scene.accent, scene.warp],
  )

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time
      materialRef.current.uniforms.uAccent.value.set(scene.accent)
      materialRef.current.uniforms.uWarp.value = scene.warp * intensity
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = time * scene.rotationSpeed * intensity
      groupRef.current.rotation.x = Math.sin(time * 0.35 * intensity) * 0.12
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={1.4 * intensity} rotationIntensity={0.5} floatIntensity={0.8 * intensity}>
        <mesh>
          <icosahedronGeometry args={[1.7, 48]} />
          <shaderMaterial
            ref={materialRef}
            uniforms={uniforms}
            vertexShader={`
              varying vec3 vNormal;
              varying vec3 vPosition;
              uniform float uTime;
              uniform float uWarp;
              void main() {
                vNormal = normal;
                vPosition = position;
                vec3 warped = position + normal * sin(position.y * 5.0 + uTime * 1.6) * uWarp;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(warped, 1.0);
              }
            `}
            fragmentShader={`
              varying vec3 vNormal;
              varying vec3 vPosition;
              uniform float uTime;
              uniform vec3 uAccent;
              void main() {
                float rim = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.0);
                float pulse = 0.55 + 0.45 * sin(uTime * 2.0 + vPosition.y * 4.0);
                vec3 porcelain = vec3(0.70, 0.86, 0.92);
                vec3 color = mix(porcelain, uAccent, clamp(rim * 0.72 + pulse * 0.28, 0.0, 1.0));
                gl_FragColor = vec4(color, 1.0);
              }
            `}
          />
        </mesh>
      </Float>
      <Html position={[0, -2.25, 0]} center>
        <span className="scene-tag">{scene.name}</span>
      </Html>
    </group>
  )
}

export default function App() {
  const [sceneId, setSceneId] = useState<SceneId>(DEFAULT_SCENE.id)
  const [intensity, setIntensity] = useState(DEFAULT_INTENSITY)
  const activeScene = getSceneById(sceneId)

  return (
    <main className="shell">
      <section className="hero" aria-labelledby="page-title">
        <div className="copy">
          <p className="kicker">자가 개선 셰이더 갤러리</p>
          <h1 id="page-title">살아 있는 비주얼 실험을 자동 PR로 진화시킵니다.</h1>
          <p className="lead">
            React Three Fiber 장면을 직접 눌러 보고, self-improving bot이 셰이더와 시각 품질 개선을
            검증 가능한 PR 제안으로 이어가도록 준비한 저장소입니다.
          </p>
          <SceneSelector selectedSceneId={sceneId} onSelectScene={setSceneId} />
          <p className="selected" aria-live="polite">
            현재 장면: {activeScene.summary}
          </p>
          <SceneInspector scene={activeScene} intensity={intensity} onIntensityChange={setIntensity} />
        </div>
        <div className="stage" aria-label={`${activeScene.name} 3D 미리보기`}>
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <color attach="background" args={['#f7fbff']} />
            <ambientLight intensity={0.95} />
            <directionalLight position={[4, 6, 5]} intensity={2.4} color="#ffffff" />
            <pointLight position={[3, 4, 5]} intensity={12 * intensity} color={activeScene.accent} />
            <ShaderCore scene={activeScene} intensity={intensity} />
            <OrbitControls enablePan={false} minDistance={3.5} maxDistance={7} />
            <EffectComposer>
              <Bloom
                intensity={activeScene.bloom * intensity}
                luminanceThreshold={0.32}
                luminanceSmoothing={0.28}
              />
              <Vignette eskil={false} offset={0.46} darkness={0.16} />
            </EffectComposer>
          </Canvas>
        </div>
      </section>
    </main>
  )
}
