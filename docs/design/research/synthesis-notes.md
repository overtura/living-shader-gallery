# Synthesis Notes

## Product Intent And User Task
사용자는 셰이더 갤러리에서 장면을 고르고 3D 결과를 바로 inspect한다.

## Adopted Principles
- 3D canvas를 가장 큰 시각 자산으로 둔다.
- UI chrome은 상태와 action만 담당한다.
- scene별 색상은 token variant로 관리한다.
- 기본 테마는 밝은 배경, 짙은 본문 텍스트, 낮은 채도의 border를 사용한다.

## Rejected Principles
- 외부 브랜드의 정확한 palette, logo, distinctive gradient는 쓰지 않는다.
- dashboard형 panel density는 gallery 목적과 맞지 않아 제외한다.
- 검은 full-screen shell은 기본 방향에서 제외한다.

## Token Changes
- `src/design-system/base.css`에 bright optical studio semantic token을 둔다.

## Component Contract Changes
- scene button, canvas stage, canvas label은 공통 token을 사용한다.

## Golden Screens
- Desktop hero with active Aurora scene
- Mobile stacked layout
- Scene selector active state
