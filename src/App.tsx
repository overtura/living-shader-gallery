import { Float, Html, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import type { CSSProperties } from 'react'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { DEFAULT_SCENE, SCENES, getSceneById } from './scenes'
import type { Scene, SceneForm, SceneId } from './scenes'

type SceneColorStyle = CSSProperties & {
  '--scene-accent': string
  '--scene-secondary'?: string
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
          style={{ '--scene-accent': scene.accent } as SceneColorStyle}
          aria-pressed={scene.id === selectedSceneId}
          onClick={() => onSelectScene(scene.id)}
        >
          {scene.name}
        </button>
      ))}
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

function SceneNotes({ scene }: { scene: Scene }) {
  return (
    <dl className="scene-notes" aria-label={`${scene.name} 검사 메타`}>
      <div>
        <dt>움직임</dt>
        <dd>{scene.motion}</dd>
      </div>
      <div>
        <dt>후처리</dt>
        <dd>{scene.post}</dd>
      </div>
      <div>
        <dt>팔레트</dt>
        <dd className="palette-value">
          <span
            className="palette-swatch"
            style={{ '--scene-accent': scene.accent } as SceneColorStyle}
            aria-hidden="true"
          />
          {scene.palette}
        </dd>
      </div>
    </dl>
  )
}

function ShaderCore({ scene }: { scene: Scene }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const groupRef = useRef<THREE.Group>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAccent: { value: new THREE.Color(scene.accent) },
      uSecondary: { value: new THREE.Color(scene.secondary) },
      uPulseSpeed: { value: scene.pulseSpeed },
      uWarpStrength: { value: scene.warpStrength },
    }),
    [scene.accent, scene.pulseSpeed, scene.secondary, scene.warpStrength],
  )

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time
      materialRef.current.uniforms.uAccent.value.set(scene.accent)
      materialRef.current.uniforms.uSecondary.value.set(scene.secondary)
      materialRef.current.uniforms.uPulseSpeed.value = scene.pulseSpeed
      materialRef.current.uniforms.uWarpStrength.value = scene.warpStrength
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.18
      groupRef.current.rotation.x = Math.sin(time * 0.35) * 0.12
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.8}>
        <mesh key={scene.form}>
          <CoreGeometry form={scene.form} />
          <shaderMaterial
            ref={materialRef}
            uniforms={uniforms}
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

export default function App() {
  const [sceneId, setSceneId] = useState<SceneId>(DEFAULT_SCENE.id)
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
          <div
            className="selected-panel"
            style={{ '--scene-accent': activeScene.accent } as SceneColorStyle}
            aria-live="polite"
          >
            <p className="selected">현재 장면: {activeScene.summary}</p>
            <SceneNotes scene={activeScene} />
          </div>
        </div>
        <div
          className="stage"
          style={
            {
              '--scene-accent': activeScene.accent,
              '--scene-secondary': activeScene.secondary,
            } as SceneColorStyle
          }
          aria-label={`${activeScene.name} 3D 미리보기`}
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <color attach="background" args={['#f7fbff']} />
            <ambientLight intensity={0.95} />
            <directionalLight position={[4, 6, 5]} intensity={2.4} color="#ffffff" />
            <pointLight position={[3, 4, 5]} intensity={activeScene.lightPower} color={activeScene.accent} />
            <pointLight position={[-3, -2, 4]} intensity={5} color={activeScene.secondary} />
            <ShaderCore scene={activeScene} />
            <OrbitControls enablePan={false} minDistance={3.5} maxDistance={7} />
            <EffectComposer>
              <Bloom intensity={activeScene.bloom} luminanceThreshold={0.32} luminanceSmoothing={0.28} />
              <Vignette eskil={false} offset={0.46} darkness={0.16} />
            </EffectComposer>
          </Canvas>
        </div>
      </section>
    </main>
  )
}
