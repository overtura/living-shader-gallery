# AGENTS.md

## Project goal
이 저장소는 overtura org의 짧은 MVP 실험 저장소다.
핵심은 코드의 완벽함보다 사용자 flow가 자연스럽게 동작하는지 검증 가능한 결과를 내는 것이다.

## Commands
- install: pnpm install
- dev: pnpm dev
- lint: pnpm lint
- typecheck: pnpm typecheck
- test: pnpm test
- build: pnpm build
- full check: pnpm check

## Done definition
- 핵심 사용자 flow가 실제로 실행된다.
- 기본 실패/빈 상태 중 최소 1개가 처리된다.
- README에 실행 방법이 있다.
- PR 요약에 검증 결과가 있다.

## Review guidelines
- 리뷰는 한국어로 작성한다.
- 사소한 취향 논쟁보다 기능 회귀, 예외 처리 누락, 테스트 누락을 우선한다.
- 깨진 사용자 flow, 빌드 오류, 타입 오류, 무한 로딩, dead click을 우선 지적한다.
