import { Image as ImageIcon, Pause, Play, RotateCcw, ScanLine } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useCallback, useState } from 'react'
import { SceneControlPanel } from './components/SceneControlPanel'
import { ShaderStage } from './components/ShaderStage'
import { DEFAULT_SCENE, SCENES, getSceneById, type SceneId } from './scenes'
import {
  getSceneTuning,
  isSceneTuningModified,
  type ShaderTuning,
  type ShaderTuningKey,
} from './shader-tuning'

type SceneColorStyle = CSSProperties & {
  '--scene-accent': string
  '--scene-secondary'?: string
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

let webGLSupport: boolean | undefined

const supportsWebGL = () => {
  if (webGLSupport !== undefined) return webGLSupport
  if (typeof document === 'undefined') return false

  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl')

    context?.getExtension('WEBGL_lose_context')?.loseContext()
    webGLSupport = Boolean(context)
    return webGLSupport
  } catch {
    webGLSupport = false
    return webGLSupport
  }
}

export default function App() {
  const [sceneId, setSceneId] = useState<SceneId>(DEFAULT_SCENE.id)
  const [tuning, setTuning] = useState<ShaderTuning>(() => getSceneTuning(DEFAULT_SCENE))
  const [isPlaying, setIsPlaying] = useState(() => !prefersReducedMotion())
  const [isWireframe, setIsWireframe] = useState(false)
  const [isStaticPreview, setIsStaticPreview] = useState(false)
  const [isWebGLAvailable] = useState(supportsWebGL)
  const [hasCanvasFailed, setHasCanvasFailed] = useState(false)
  const [resetRevision, setResetRevision] = useState(0)
  const [referenceTuning, setReferenceTuning] = useState<ShaderTuning | null>(null)
  const activeScene = getSceneById(sceneId)
  const isModified = isSceneTuningModified(activeScene, tuning)
  const previewMode = !isWebGLAvailable ? 'unsupported' : hasCanvasFailed ? 'error' : isStaticPreview ? 'manual' : null
  const usesStaticPreview = previewMode !== null
  const handleCanvasError = useCallback(() => setHasCanvasFailed(true), [])

  const selectScene = (nextSceneId: SceneId) => {
    const nextScene = getSceneById(nextSceneId)
    setSceneId(nextSceneId)
    setTuning(getSceneTuning(nextScene))
    setReferenceTuning(null)
  }

  const updateTuning = (key: ShaderTuningKey, value: number) => {
    setTuning((current) => ({ ...current, [key]: value }))
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <h1>Living Shader Gallery</h1>
            <p>실시간 광학 장면 실험실</p>
          </div>
        </div>
        <div className="header-status" aria-label="갤러리 상태">
          <span aria-hidden="true" />
          샘플 장면 {SCENES.length}개
        </div>
      </header>

      <div className="gallery-workspace">
        <aside className="scene-sidebar" aria-labelledby="scene-list-title">
          <header className="sidebar-heading">
            <p className="eyebrow">장면 라이브러리</p>
            <h2 id="scene-list-title">검사할 장면 선택</h2>
          </header>
          <div className="scene-list" role="group" aria-label="셰이더 장면 선택">
            {SCENES.map((scene, index) => (
              <button
                key={scene.id}
                type="button"
                className={scene.id === sceneId ? 'active' : ''}
                style={{ '--scene-accent': scene.accent } as SceneColorStyle}
                aria-pressed={scene.id === sceneId}
                onClick={() => selectScene(scene.id)}
              >
                <span className="scene-order">{String(index + 1).padStart(2, '0')}</span>
                <span className="scene-swatch" aria-hidden="true" />
                <span className="scene-list-copy">
                  <strong>{scene.name}</strong>
                  <small>{scene.summary}</small>
                </span>
              </button>
            ))}
          </div>
          <dl className="scene-notes" aria-label={`${activeScene.name} 검사 메타`}>
            <div>
              <dt>움직임</dt>
              <dd>{activeScene.motion}</dd>
            </div>
            <div>
              <dt>후처리</dt>
              <dd>{activeScene.post}</dd>
            </div>
            <div>
              <dt>팔레트</dt>
              <dd>
                <span
                  className="palette-swatch"
                  style={{ '--scene-accent': activeScene.accent } as SceneColorStyle}
                  aria-hidden="true"
                />
                {activeScene.palette}
              </dd>
            </div>
          </dl>
        </aside>

        <section
          className="shader-workbench"
          style={
            {
              '--scene-accent': activeScene.accent,
              '--scene-secondary': activeScene.secondary,
            } as SceneColorStyle
          }
          aria-labelledby="stage-title"
        >
          <header className="stage-toolbar">
            <div>
              <p className="eyebrow">현재 장면</p>
              <h2 id="stage-title">{activeScene.name}</h2>
              <p>{activeScene.summary}</p>
            </div>
            <div className="stage-actions" role="toolbar" aria-label="셰이더 장면 도구">
              <button
                type="button"
                title={usesStaticPreview ? '3D 보기에서 사용할 수 있습니다' : isPlaying ? '모션 켜짐' : '모션 꺼짐'}
                aria-label="모션"
                aria-pressed={isPlaying}
                disabled={usesStaticPreview}
                onClick={() => setIsPlaying((current) => !current)}
              >
                {isPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
              </button>
              <button
                type="button"
                title="Wireframe 검사"
                aria-label="Wireframe 검사"
                aria-pressed={isWireframe}
                disabled={usesStaticPreview}
                onClick={() => setIsWireframe((current) => !current)}
              >
                <ScanLine size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                title="카메라 시점 초기화"
                aria-label="카메라 시점 초기화"
                disabled={usesStaticPreview}
                onClick={() => setResetRevision((revision) => revision + 1)}
              >
                <RotateCcw size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="preview-mode-toggle"
                title={
                  !isWebGLAvailable
                    ? '이 환경에서는 WebGL 대신 정적 미리보기를 표시합니다'
                    : hasCanvasFailed
                      ? '3D 캔버스 오류로 정적 미리보기를 표시합니다'
                    : isStaticPreview
                      ? '인터랙티브 3D 캔버스로 돌아갑니다'
                      : 'WebGL을 쉬게 하고 장면의 색과 형태만 확인합니다'
                }
                aria-label="정적 보기"
                aria-pressed={usesStaticPreview}
                disabled={!isWebGLAvailable || hasCanvasFailed}
                onClick={() => setIsStaticPreview((current) => !current)}
              >
                <ImageIcon size={17} aria-hidden="true" />
                <span>정적 보기</span>
              </button>
            </div>
          </header>
          <div
            className="shader-canvas"
            role={usesStaticPreview ? 'status' : 'img'}
            aria-label={
              usesStaticPreview
                ? `${activeScene.name} 정적 미리보기. WebGL을 사용하지 않고 장면의 색과 형태를 표시합니다.`
                : `${activeScene.name} 3D 미리보기. ${isPlaying ? '모션 재생 중' : '모션 일시정지'}. ${
                    isWireframe ? 'Wireframe 표시 중' : '표면 표시 중'
                  }.`
            }
          >
            <ShaderStage
              scene={activeScene}
              tuning={tuning}
              isPlaying={isPlaying}
              isWireframe={isWireframe}
              previewMode={previewMode}
              resetRevision={resetRevision}
              onCanvasError={handleCanvasError}
            />
          </div>
          <SceneControlPanel
            scene={activeScene}
            tuning={tuning}
            isModified={isModified}
            referenceTuning={referenceTuning}
            onChange={updateTuning}
            onReset={() => setTuning(getSceneTuning(activeScene))}
            onApplyPreset={setTuning}
            onSaveReference={() => setReferenceTuning(tuning)}
            onRestoreReference={() => referenceTuning && setTuning(referenceTuning)}
          />
        </section>
      </div>
    </main>
  )
}
