export const SCENES = [
  {
    id: 'aurora',
    name: '오로라 코어',
    summary: '시간에 따라 표면이 흔들리는 청록 스펙트럼 레이어',
    accent: '#007f9e',
    secondary: '#78dce8',
    form: 'icosahedron',
    motion: '유영형 리플',
    post: '균형 bloom',
    palette: 'cyan / porcelain',
    pulseSpeed: 1.6,
    warpStrength: 0.09,
    bloom: 0.38,
    lightPower: 12,
  },
  {
    id: 'ember',
    name: '엠버 필드',
    summary: '입자 굴절과 따뜻한 bloom을 실험하는 장면',
    accent: '#b95718',
    secondary: '#ffc071',
    form: 'dodecahedron',
    motion: '짧은 열파',
    post: 'warm bloom',
    palette: 'amber / cream',
    pulseSpeed: 2.1,
    warpStrength: 0.07,
    bloom: 0.48,
    lightPower: 14,
  },
  {
    id: 'violet',
    name: '바이올렛 페이즈',
    summary: '윤곽, 림라이트, 대비를 조정하는 장면',
    accent: '#6f57d8',
    secondary: '#b6a3ff',
    form: 'torusKnot',
    motion: '느린 림 페이즈',
    post: 'contrast rim',
    palette: 'violet / ice',
    pulseSpeed: 1.25,
    warpStrength: 0.055,
    bloom: 0.34,
    lightPower: 11,
  },
  {
    id: 'prism',
    name: '프리즘 링',
    summary: '중앙 링을 따라 cyan과 violet 위상이 교차하는 신규 샘플 장면',
    accent: '#007a96',
    secondary: '#8a63f6',
    form: 'torus',
    motion: '링 궤도 스윕',
    post: 'prism bloom',
    palette: 'cyan / violet',
    pulseSpeed: 1.9,
    warpStrength: 0.065,
    bloom: 0.42,
    lightPower: 13,
  },
] as const

export type Scene = (typeof SCENES)[number]
export type SceneId = Scene['id']
export type SceneForm = Scene['form']

export const DEFAULT_SCENE = SCENES[0]

export function getSceneById(sceneId: SceneId): Scene {
  return SCENES.find((scene) => scene.id === sceneId) ?? DEFAULT_SCENE
}
