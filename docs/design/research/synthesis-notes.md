# Synthesis Notes

## Product Intent And User Task
사용자는 한국어 셰이더 갤러리에서 장면을 고르고 3D 결과를 바로 inspect한다.

## Adopted Principles
- 3D canvas를 가장 큰 시각 자산으로 둔다.
- UI chrome은 status와 action만 담당한다.
- scene별 색상은 token variant로 관리한다.

## Rejected Principles
- 외부 브랜드의 정확한 palette, logo, distinctive gradient는 쓰지 않는다.
- dashboard식 panel density는 gallery 목적과 맞지 않아 제외한다.

## Token Changes
- `src/design-system/base.css`에 spectral dark theme semantic token을 둔다.

## Component Contract Changes
- scene button, canvas stage, canvas label은 공통 token을 사용한다.

## Golden Screens
- Desktop hero with active Aurora scene
- Mobile stacked layout
- Scene selector active state
