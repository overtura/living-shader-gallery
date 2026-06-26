# AGENTS.md

## Project goal
이 저장소는 overtura 조직의 시각 실험형 MVP 저장소다. 핵심은 React Three Fiber 장면을 작게 추가하고, self-improving bot이 안전한 PR 단위로 갤러리를 개선하게 만드는 것이다.

## Commands
- install: `pnpm install`
- dev: `pnpm dev`
- lint: `pnpm lint`
- typecheck: `pnpm typecheck`
- test: `pnpm test`
- build: `pnpm build`
- full check: `pnpm check`
- self-improve context: `pnpm self-improve:context`
- self-improve guard: `pnpm self-improve:guard`

## Done definition
- 핵심 장면 선택 flow가 실제로 동작한다.
- 3D canvas가 desktop/mobile에서 비어 있지 않다.
- README에 실행 방법과 자가 개선 방식이 있다.
- PR 요약에 검증 결과가 있다.

## Review guidelines
- 리뷰와 사용자-facing 문구는 기본적으로 한국어로 작성한다.
- 사소한 취향보다 빌드 오류, 타입 오류, 빈 canvas, dead click, 과한 권한 workflow를 우선 지적한다.
- self-improve 변경은 민감 정보 guard와 `pnpm check` 통과 여부를 먼저 본다.

## External design tool rules
- UI 작업 전에 `DESIGN.md`, `src/design-system/base.css`, 현재 golden screen 역할의 첫 화면을 먼저 읽는다.
- `portfolio-design-tools-integration-pack`과 외부 디자인 레퍼런스는 참고 자료이며 source of truth가 아니다.
- 외부 브랜드의 정확한 색, 로고, 폰트, 고유한 composition을 복제하지 않는다.
- token 또는 shared component contract 변경은 별도 design-system 성격의 PR로 분리한다.
