import { Gauge, Image as ImageIcon, MousePointer2, Pause, Play, RotateCcw, ScanLine, ZoomIn } from 'lucide-react'
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

export default function App() {
  const [sceneId, setSceneId] = useState<SceneId>(DEFAULT_SCENE.id)
  const [tuning, setTuning] = useState<ShaderTuning>(() => getSceneTuning(DEFAULT_SCENE))
  const [isPlaying, setIsPlaying] = useState(() => !prefersReducedMotion())
  const [isWireframe, setIsWireframe] = useState(false)
  const [isLowPower, setIsLowPower] = useState(false)
  const [isStaticPreview, setIsStaticPreview] = useState(false)
  const [isCanvasAvailable, setIsCanvasAvailable] = useState(false)
  const [isCanvasPending, setIsCanvasPending] = useState(false)
  const [resetRevision, setResetRevision] = useState(0)
  const [referenceTuning, setReferenceTuning] = useState<ShaderTuning | null>(null)
  const activeScene = getSceneById(sceneId)
  const isModified = isSceneTuningModified(activeScene, tuning)
  const isInteractiveCanvas = isCanvasAvailable && !isStaticPreview && !isCanvasPending

  const handleCanvasAvailabilityChange = useCallback((isAvailable: boolean) => {
    setIsCanvasAvailable(isAvailable)
    setIsCanvasPending(false)
  }, [])

  const togglePreviewMode = () => {
    setIsCanvasPending(isStaticPreview)
    setIsStaticPreview((current) => !current)
  }

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
                style={
                  {
                    '--scene-accent': scene.accent,
                    '--scene-secondary': scene.secondary,
                  } as SceneColorStyle
                }
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
                title={isPlaying ? '모션 켜짐' : '모션 꺼짐'}
                aria-label="모션"
                aria-pressed={isPlaying}
                disabled={!isInteractiveCanvas}
                onClick={() => setIsPlaying((current) => !current)}
              >
                {isPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
              </button>
              <button
                type="button"
                title="Wireframe 검사"
                aria-label="Wireframe 검사"
                aria-pressed={isWireframe}
                disabled={!isInteractiveCanvas}
                onClick={() => setIsWireframe((current) => !current)}
              >
                <ScanLine size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                title={isLowPower ? '저부하 렌더링 끄기' : '저부하 렌더링 켜기'}
                aria-label="저부하 렌더링"
                aria-pressed={isLowPower}
                disabled={!isInteractiveCanvas}
                onClick={() => setIsLowPower((current) => !current)}
              >
                <Gauge size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                title="카메라 시점 초기화"
                aria-label="카메라 시점 초기화"
                disabled={!isInteractiveCanvas}
                onClick={() => setResetRevision((revision) => revision + 1)}
              >
                <RotateCcw size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="preview-mode-toggle"
                title={
                  !isCanvasAvailable
                    ? '3D 캔버스를 사용할 수 없어 정적 프리뷰를 표시합니다'
                    : isStaticPreview
                      ? '인터랙티브 3D 캔버스로 돌아갑니다'
                      : 'WebGL을 쉬게 하고 장면의 색과 형태만 확인합니다'
                }
                aria-label="정적 보기"
                aria-pressed={isStaticPreview}
                disabled={!isCanvasAvailable}
                onClick={togglePreviewMode}
              >
                <ImageIcon size={17} aria-hidden="true" />
                <span>정적 보기</span>
              </button>
            </div>
          </header>
          <div className="shader-canvas-frame">
            {isLowPower && isInteractiveCanvas && (
              <p className="render-mode-status" role="status">
                저부하 모드 · 해상도 1× · 후처리 꺼짐
              </p>
            )}
            <div className="shader-canvas">
              <ShaderStage
                scene={activeScene}
                tuning={tuning}
                isPlaying={isPlaying}
                isWireframe={isWireframe}
                isLowPower={isLowPower}
                isStaticPreview={isStaticPreview}
                resetRevision={resetRevision}
                onAvailabilityChange={handleCanvasAvailabilityChange}
              />
            </div>
            <div className="viewport-status-rail" role="group" aria-label="현재 뷰포트 상태">
              <div className="viewport-state-list">
                <span className={isInteractiveCanvas && isPlaying ? 'viewport-live is-playing' : 'viewport-live'}>
                  <span aria-hidden="true" />
                  {isInteractiveCanvas ? (isPlaying ? '재생 중' : '일시정지') : isCanvasPending ? '3D 준비 중' : '정적 프리뷰'}
                </span>
                <span>
                  <strong>표면</strong>
                  {isInteractiveCanvas ? (isWireframe ? 'Wireframe' : 'Shader') : isCanvasPending ? '초기화 중' : '대표 색상'}
                </span>
                <span>
                  <strong>품질</strong>
                  {isInteractiveCanvas
                    ? isLowPower
                      ? '저부하'
                      : '고품질'
                    : isCanvasPending
                      ? 'WebGL 준비'
                      : isStaticPreview
                        ? 'WebGL 휴식'
                        : 'WebGL 없음'}
                </span>
              </div>
              {isInteractiveCanvas ? (
                <p className="viewport-gesture-hint">
                  <span>
                    <MousePointer2 size={14} aria-hidden="true" />
                    드래그 회전
                  </span>
                  <span>
                    <ZoomIn size={14} aria-hidden="true" />
                    <span className="desktop-gesture-label">휠 확대</span>
                    <span className="mobile-gesture-label">핀치 확대</span>
                  </span>
                </p>
              ) : (
                <p className="viewport-gesture-hint">
                  {isCanvasPending ? '3D 캔버스를 준비하고 있어요' : '장면 정보와 조정값 탐색 가능'}
                </p>
              )}
            </div>
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
