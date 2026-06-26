# AGENTS.md

## Project Goal
이 저장소는 overtura 조직의 시각 실험 MVP다. React Three Fiber 장면을 작게 추가하고, 중앙 maintainer bot이 안전한 PR 단위로 갤러리를 개선하게 만드는 것이 목적이다.

## Commands
- install: `pnpm install`
- dev: `pnpm dev`
- lint: `pnpm lint`
- typecheck: `pnpm typecheck`
- test: `pnpm test`
- build: `pnpm build`
- full check: `pnpm check`

## Done Definition
- 핵심 장면 선택 flow가 실제로 동작한다.
- 3D canvas가 desktop/mobile에서 비어 있지 않다.
- README와 `maintainer-bot/` 설정에 실행 방법과 자가 개선 방향이 있다.
- PR 요약에 검증 결과가 있다.

## Review Guidelines
- 사용자-facing 문구는 기본적으로 한국어로 작성한다.
- 빌드 오류, 타입 오류, 빈 canvas, dead click, 과한 workflow 권한을 우선 지적한다.
- 중앙 maintainer bot 변경은 target profile, deny path, `pnpm check` 통과 여부를 먼저 본다.

## Central Maintainer Bot Rules
- 자가 개선 엔진은 이 저장소에 두지 않고 `okorion/self-improving-maintainer-bot` 중앙 control plane에서 실행한다.
- 이 저장소에는 `maintainer-bot/project.json`, `maintainer-bot/backlog.md`, `maintainer-bot/evals/docs_qa.jsonl`만 target repo 설정으로 둔다.
- 반복 루프는 작은 PR 하나로 끝나야 하며, `maintainer-bot/backlog.md`의 후보를 우선 활용한다.
- `.github/workflows/**`, credential, auth/security, infra, migration 성격의 변경은 R3로 취급하고 draft/proposal only로 다룬다.
- 실제 secret, API key, private credential은 만들지 않는다.

## External Design Tool Rules
- UI 작업 전 `DESIGN.md`, `src/design-system/base.css`, 현재 golden screen 역할의 첫 화면을 먼저 읽는다.
- `portfolio-design-tools-integration-pack`과 외부 디자인 레퍼런스는 참고 자료이며 source of truth가 아니다.
- 외부 브랜드의 정확한 로고, 폰트, 고유 composition을 복제하지 않는다.
- token 또는 shared component contract 변경은 별도 design-system 성격의 PR로 분리한다.
