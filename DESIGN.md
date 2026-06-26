# DESIGN.md - Living Shader Gallery

## Product Intent
React Three Fiber 기반의 self-improving 셰이더 갤러리다. 사용자는 장면을 선택하고 3D 캔버스를 직접 회전하며 셰이더, 후처리, 색상 반응을 빠르게 판단한다.

## Design Authority
우선순위는 이 문서, CSS semantic token, 컴포넌트 규약, 외부 디자인 도구와 레퍼런스 순서다. 외부 브랜드의 고유한 로고, 서체, 구성은 복제하지 않는다.

## Visual Character
```txt
Bright
Optical
Focused
Technical
Gallery-like
```

- 기본 배경은 흰색과 옅은 하늘색을 중심으로 한 밝은 optical studio다.
- cyan은 primary action과 셰이더 핵심 장면, violet은 후처리 실험, amber는 warm variant에만 사용한다.
- 3D canvas가 주인공이며 주변 UI는 밝고 조용해야 한다.
- glass effect는 흰색 translucent surface와 얕은 blur로만 사용한다.

## Typography
- UI: Inter, Pretendard, system-ui
- Display: 40-76px, tight line-height, letter-spacing 0
- Body: 18/31
- Control: 14/20, medium
- Canvas label: 13/16

## Layout
- Desktop shell padding: 64px max, mobile 20px
- Hero는 copy와 full-height canvas의 2-column 구조다.
- Canvas frame radius는 8px 이하로 유지한다.
- Stage minimum height: desktop 420px, mobile 360px

## Component Rules
- Scene selector는 segmented pill button family를 사용한다.
- 모든 scene button은 selected 상태를 색상, border, contrast로 같이 표현한다.
- Canvas label은 밝은 translucent surface와 blur를 사용한다.
- Decorative radial glow는 배경에만 허용하고 UI card 안에는 넣지 않는다.

## Interaction Model
```txt
Select scene -> Inspect motion -> Rotate canvas -> Propose visual PR
```

- 장면 선택은 즉시 canvas 내 조명과 색을 바꾼다.
- Orbit interaction은 canvas 안에서만 동작한다.
- self-improve 변경은 scene, token tuning, 접근성, 성능 개선 단위로 작게 제안한다.

## Responsive Rules
- 900px 이하에서는 copy와 canvas를 세로로 쌓는다.
- 버튼은 wrap을 허용하되 높이와 typography가 흔들리지 않아야 한다.
- canvas는 320px 폭에서도 빈 영역 없이 보이게 유지한다.

## Anti-patterns
- full-page purple glow
- 검은 canvas shell
- stock-like hero image
- nested cards
- tiny unreadable shader labels
- canvas보다 큰 설명 panel
