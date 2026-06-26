# 자가 개선 운영 규칙

이 저장소는 GitHub Actions 기반 self-improving maintainer bot을 포함한다.

## 동작 방식
- `Self Improve` workflow가 저장소 컨텍스트를 생성한다.
- GitHub Models가 작은 unified diff를 제안한다.
- `self-improve:guard`가 민감 정보, 위험 workflow 패턴, diff 오류를 차단한다.
- `pnpm check`가 통과하면 `self-improve`, `automerge` 라벨이 붙은 PR을 만든다.
- `auto_merge=true`일 때 PR은 squash merge까지 자동으로 진행된다.

## 허용 범위
- 기능, 시각 개선, 문서, 접근성, 성능, workflow 개선 PR
- 한국어 문구 보강과 README/운영 문서 개선
- 민감 정보가 없는 데모 데이터와 정적 자산

## 차단 범위
- 실제 secret, token, private key, credential 파일
- `.env`, `.npmrc`, 인증서, 개인 키
- 무제한 권한 상승 workflow
- secret 참조를 새로 추가하는 workflow
- `pull_request_target` 기반 위험 checkout 패턴

## 수동 실행
```bash
pnpm self-improve:context
pnpm self-improve:guard
pnpm check
```
