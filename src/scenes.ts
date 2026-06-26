export const SCENES = [
  {
    id: 'aurora',
    name: '오로라 코어',
    summary: '시간에 따라 표면이 흔들리는 청록 스펙트럼 레이어',
    accent: '#007f9e',
  },
  {
    id: 'ember',
    name: '엠버 필드',
    summary: '입자 굴절과 따뜻한 bloom을 실험하는 장면',
    accent: '#e66f2e',
  },
  {
    id: 'violet',
    name: '바이올렛 페이즈',
    summary: '윤곽, 림라이트, 대비를 조정하는 장면',
    accent: '#6f57d8',
  },
] as const

export type Scene = (typeof SCENES)[number]
export type SceneId = Scene['id']

export const DEFAULT_SCENE = SCENES[0]
export const DEFAULT_SCENE_ID: SceneId = DEFAULT_SCENE.id

export function getSceneById(sceneId: SceneId): Scene {
  return SCENES.find((scene) => scene.id === sceneId) ?? DEFAULT_SCENE
}
