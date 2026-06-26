# Living Shader Gallery 자가 개선 Backlog

작고 안전한 PR 단위로만 처리한다.

## Planning
- 장면 추가 기준과 shader parameter naming 규칙을 `DESIGN.md`에 보강한다.
- self-improve 루프별 검증 항목을 `docs/SELF_IMPROVEMENT.md`에 더 구체화한다.

## Feature
- 민감 정보 없이 동작하는 새 샘플 scene metadata를 추가한다.
- 현재 선택된 scene의 설명을 더 구체적인 한국어 문구로 개선한다.

## Design / Visual
- 밝은 optical studio 톤을 유지하면서 canvas label, button, stage contrast를 미세 조정한다.
- 모바일에서 H1과 scene selector의 줄바꿈을 더 자연스럽게 다듬는다.

## Accessibility
- 3D canvas 안내 문구와 keyboard/focus 설명을 보강한다.
- reduced motion 환경에서 shader motion 설명과 fallback을 문서화한다.

## Performance
- Three.js bundle 크기 경고를 문서화하고 향후 code splitting 후보를 정리한다.
