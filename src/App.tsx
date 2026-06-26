import { Float, Html, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { DEFAULT_SCENE_ID, SCENES, getSceneById, type Scene, type SceneId } from './scenes'

function ShaderCore({ scene }: { scene: Scene }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const groupRef = useRef<THREE.Group>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAccent: { value: new THREE.Color(scene.accent) },
    }),
    [scene.accent],
  )

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time
      materialRef.current.uniforms.uAccent.value.set(scene.accent)
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.18
      groupRef.current.rotation.x = Math.sin(time * 0.35) * 0.12
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.8}>
        <mesh>
          <icosahedronGeometry args={[1.7, 48]} />
          <shaderMaterial
            ref={materialRef}
            uniforms={uniforms}
            vertexShader={`
              varying vec3 vNormal;
              varying vec3 vPosition;
              uniform float uTime;
              void main() {
                vNormal = normal;
                vPosition = position;
                vec3 warped = position + normal * sin(position.y * 5.0 + uTime * 1.6) * 0.09;
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
  const [sceneId, setSceneId] = useState<SceneId>(DEFAULT_SCENE_ID)
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
          <div className="actions" role="group" aria-label="장면 선택">
            {SCENES.map((scene) => (
              <button
                key={scene.id}
                type="button"
                className={scene.id === sceneId ? 'active' : ''}
                onClick={() => setSceneId(scene.id)}
              >
                {scene.name}
              </button>
            ))}
          </div>
          <p className="selected">현재 장면: {activeScene.summary}</p>
        </div>
        <div className="stage" aria-label={`${activeScene.name} 3D 미리보기`}>
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <color attach="background" args={['#f7fbff']} />
            <ambientLight intensity={0.95} />
            <directionalLight position={[4, 6, 5]} intensity={2.4} color="#ffffff" />
            <pointLight position={[3, 4, 5]} intensity={12} color={activeScene.accent} />
            <ShaderCore scene={activeScene} />
            <OrbitControls enablePan={false} minDistance={3.5} maxDistance={7} />
            <EffectComposer>
              <Bloom intensity={0.38} luminanceThreshold={0.32} luminanceSmoothing={0.28} />
              <Vignette eskil={false} offset={0.46} darkness={0.16} />
            </EffectComposer>
          </Canvas>
        </div>
      </section>
    </main>
  )
}
