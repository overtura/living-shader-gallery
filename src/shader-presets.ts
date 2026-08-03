import type { ShaderTuning } from './shader-tuning'

export type ShaderTuningPreset = {
  id: 'calm' | 'balanced' | 'expressive'
  label: string
  description: string
  tuning: ShaderTuning
}

export const SHADER_TUNING_PRESETS = [
  {
    id: 'calm',
    label: '잔잔하게',
    description: '느린 펄스와 낮은 bloom으로 형태를 살펴봅니다.',
    tuning: { pulseSpeed: 0.8, warpStrength: 0.035, bloom: 0.14 },
  },
  {
    id: 'balanced',
    label: '균형',
    description: '형태와 움직임을 함께 비교하는 기본 프로필입니다.',
    tuning: { pulseSpeed: 1.5, warpStrength: 0.07, bloom: 0.32 },
  },
  {
    id: 'expressive',
    label: '강조',
    description: '변형과 빛 확산을 높여 장면의 반응을 확인합니다.',
    tuning: { pulseSpeed: 2.4, warpStrength: 0.12, bloom: 0.58 },
  },
] as const satisfies readonly ShaderTuningPreset[]
