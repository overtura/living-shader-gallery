import { Bookmark, RotateCcw, SlidersHorizontal, Undo2 } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { Scene } from '../scenes'
import { SHADER_TUNING_PRESETS, isSameShaderTuning } from '../shader-presets'
import { SHADER_TUNING_CONTROLS, type ShaderTuning, type ShaderTuningKey } from '../shader-tuning'

type SceneControlPanelProps = {
  scene: Scene
  tuning: ShaderTuning
  isModified: boolean
  referenceTuning: ShaderTuning | null
  onChange: (key: ShaderTuningKey, value: number) => void
  onReset: () => void
  onApplyPreset: (tuning: ShaderTuning) => void
  onSaveReference: () => void
  onRestoreReference: () => void
}

type AccentStyle = CSSProperties & {
  '--scene-accent': string
}

export function SceneControlPanel({
  scene,
  tuning,
  isModified,
  referenceTuning,
  onChange,
  onReset,
  onApplyPreset,
  onSaveReference,
  onRestoreReference,
}: SceneControlPanelProps) {
  return (
    <section className="control-panel" aria-labelledby="control-panel-title">
      <div className="control-heading">
        <div>
          <p className="eyebrow">실시간 조정</p>
          <h2 id="control-panel-title">
            <SlidersHorizontal size={17} aria-hidden="true" />
            셰이더 파라미터
          </h2>
        </div>
        <button type="button" disabled={!isModified} onClick={onReset}>
          <RotateCcw size={15} aria-hidden="true" />
          원값 복원
        </button>
      </div>
      <div className="tuning-utility">
        <div className="preset-strip" aria-labelledby="preset-title">
          <div>
            <p id="preset-title">빠른 렌더 프로필</p>
            <span>현재 장면의 세 값을 함께 바꿉니다.</span>
          </div>
          <div className="preset-list" role="group" aria-label="빠른 렌더 프로필">
            {SHADER_TUNING_PRESETS.map((preset) => {
              const isActive = isSameShaderTuning(tuning, preset.tuning)

              return (
                <button
                  key={preset.id}
                  type="button"
                  className={isActive ? 'active' : ''}
                  aria-pressed={isActive}
                  title={preset.description}
                  onClick={() => onApplyPreset(preset.tuning)}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
        </div>
        <div className="reference-actions" aria-label="비교 기준점">
          <button type="button" title="현재 값을 비교 기준점으로 저장" onClick={onSaveReference}>
            <Bookmark size={15} aria-hidden="true" />
            기준 저장
          </button>
          <button type="button" title="저장한 비교 기준점으로 복원" disabled={!referenceTuning} onClick={onRestoreReference}>
            <Undo2 size={15} aria-hidden="true" />
            기준 복원
          </button>
        </div>
      </div>
      <div className="tuning-grid">
        {SHADER_TUNING_CONTROLS.map((control) => {
          const value = tuning[control.key]

          return (
            <label key={control.key} className="range-control" htmlFor={`tuning-${control.key}`}>
              <span className="range-label">
                <strong>{control.label}</strong>
                <output htmlFor={`tuning-${control.key}`}>{control.format(value)}</output>
              </span>
              <input
                id={`tuning-${control.key}`}
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={value}
                aria-valuetext={control.format(value)}
                style={{ '--scene-accent': scene.accent } as AccentStyle}
                onChange={(event) => onChange(control.key, Number(event.currentTarget.value))}
              />
              <small>{control.description}</small>
            </label>
          )
        })}
      </div>
    </section>
  )
}
