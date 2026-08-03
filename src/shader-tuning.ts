import type { Scene } from './scenes'

export type ShaderTuning = {
  pulseSpeed: number
  warpStrength: number
  bloom: number
}

export type ShaderTuningKey = keyof ShaderTuning

export const SHADER_TUNING_CONTROLS = [
  {
    key: 'pulseSpeed',
    label: 'Pulse 속도',
    description: '표면 색상 파동의 반복 속도',
    min: 0.4,
    max: 3,
    step: 0.1,
    format: (value: number) => `${value.toFixed(1)}x`,
  },
  {
    key: 'warpStrength',
    label: 'Warp 강도',
    description: '법선 방향 표면 변형 폭',
    min: 0.01,
    max: 0.16,
    step: 0.005,
    format: (value: number) => value.toFixed(3),
  },
  {
    key: 'bloom',
    label: 'Bloom 강도',
    description: '밝은 영역의 후처리 확산량',
    min: 0,
    max: 0.8,
    step: 0.02,
    format: (value: number) => value.toFixed(2),
  },
] as const

export const getSceneTuning = (scene: Scene): ShaderTuning => ({
  pulseSpeed: scene.pulseSpeed,
  warpStrength: scene.warpStrength,
  bloom: scene.bloom,
})

export const areShaderTuningsEqual = (left: ShaderTuning, right: ShaderTuning) =>
  left.pulseSpeed === right.pulseSpeed && left.warpStrength === right.warpStrength && left.bloom === right.bloom

export const isSceneTuningModified = (scene: Scene, tuning: ShaderTuning) =>
  !areShaderTuningsEqual(getSceneTuning(scene), tuning)
