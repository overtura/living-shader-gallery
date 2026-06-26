# 자가 개선 운영 규칙

이 저장소는 GitHub Actions 기반 self-improving maintainer bot을 포함한다.

## 동작 방식

1. `Self Improve` workflow가 저장소 컨텍스트와 prompt를 생성한다.
2. GitHub Models가 작은 unified diff를 제안한다.
3. `apply-ai-patch.mjs`가 적용 가능한 diff만 반영한다.
4. `self-improve:guard`가 민감 정보, 위험 workflow 패턴, diff 오류를 차단한다.
5. `pnpm check`가 통과하면 `self-improve`, `automerge` 라벨이 붙은 PR을 만든다.
6. `auto_merge=true`일 때 PR은 squash merge까지 자동으로 진행된다.

## 수동 실행

GitHub Actions의 `Self Improve` workflow에서 다음 값을 선택한다.

- `focus`: `planning`, `feature`, `design`, `visual`, `workflow`, `docs`, `accessibility`, `performance`
- `instruction`: 이번 루프의 추가 목표. 비워도 된다.
- `model`: 기본값 `openai/gpt-4o`
- `auto_merge`: 기본값 `true`

## 반복 루프 권장 순서

4~5회 검증 루프는 다음 순서를 권장한다.

1. `planning`: backlog 또는 설계 기준 정리
2. `design`: 디자인 시스템과 화면 구조 개선
3. `feature`: 작고 안전한 기능 또는 예제 추가
4. `accessibility`: aria, semantic markup, reduced motion 보강
5. `workflow` 또는 `docs`: 운영 문서와 자동화 메시지 개선

각 루프는 작은 PR 하나로 끝나야 한다.

## 필수 GitHub 설정

- Actions workflow permissions: `read/write`
- `GITHUB_TOKEN` 권한: `contents: write`, `pull-requests: write`, `issues: write`, `models: read`
- squash merge 허용
- delete branch on merge 권장
- GitHub Models 사용 가능

## 허용 범위

- 기능 기획, 설계, 문서, 샘플 데이터, 접근성, 성능, workflow 개선
- 한국어 문구 보강
- 민감 정보가 없는 데모/시드 데이터
- 저장소의 기존 기술 스택과 디자인 시스템을 따르는 작은 코드 변경

## 차단 범위

- 실제 secret, token, private key, credential 파일
- `.env`, `.npmrc`, 인증서, 개인 키
- 무제한 권한 상승 workflow
- secret 참조를 새로 추가하는 workflow
- 위험한 shell 다운로드/실행 패턴

## 로컬 검증

```bash
pnpm self-improve:context
pnpm self-improve:guard
pnpm check
```
