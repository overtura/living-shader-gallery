import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { Scene } from '../scenes'
import { SHADER_TUNING_CONTROLS, type ShaderTuning, type ShaderTuningKey } from '../shader-tuning'

type SceneControlPanelProps = {
  scene: Scene
  tuning: ShaderTuning
  isModified: boolean
  onChange: (key: ShaderTuningKey, value: number) => void
  onReset: () => void
}

type AccentStyle = CSSProperties & {
  '--scene-accent': string
}

export function SceneControlPanel({
  scene,
  tuning,
  isModified,
  onChange,
  onReset,
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
