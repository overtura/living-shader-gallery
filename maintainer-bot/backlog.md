# Living Shader Gallery Maintainer Bot Backlog

중앙 control plane은 `okorion/self-improving-maintainer-bot`이다. 이 저장소에는 얇은 target 설정만 둔다.

## 운영 검증
- 모든 변경은 `pnpm check`를 통과해야 한다.
- 자동 merge 기본값은 꺼져 있다.
- `.github/workflows/**`, credential, auth/security, infra, migration 변경은 R3로 취급하고 draft/proposal only로 다룬다.

## 문서 QA 기준
- 프로젝트 설명은 `Living Shader Gallery` 이름과 React Three Fiber 기반 3D 갤러리 목적을 분명히 포함한다.
- 기본 검증 명령은 `pnpm check`로 안내한다.
- workflow 변경은 항상 R3 proposal-only 대상으로 설명한다.

## R0 Report
- 장면 추가 기준과 shader parameter naming 규칙의 누락을 분석 리포트로 정리한다.
- Three.js bundle 크기 경고와 code splitting 후보를 리포트로 정리한다.

## R1 PR 후보
- 새 샘플 scene metadata를 민감 정보 없이 추가한다.
- 현재 선택된 scene 설명을 더 구체적인 한국어 문구로 개선한다.
- 밝은 optical studio 톤을 유지하면서 canvas label, button, stage contrast를 미세 조정한다.

## R2 Draft 후보
- 렌더링 성능 개선이나 의존성 변경은 draft PR로만 제안한다.

## R3 Proposal only
- workflow, credential, security, infra, migration 관련 변경은 코드 변경 없이 proposal로만 다룬다.
