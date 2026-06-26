# Living Shader Gallery

React Three Fiber 기반의 인터랙티브 셰이더 갤러리입니다. 각 장면은 작은 컴포넌트로 분리하고, self-improving maintainer bot이 새 장면, 시각 개선, workflow 개선을 자동 PR로 제안한 뒤 guard/check 통과 시 자동 merge까지 진행하도록 세팅합니다.

## 목적
- 셰이더, 입자, 후처리, 카메라 인터랙션을 빠르게 실험한다.
- PR마다 시각 결과와 성능 리스크를 작게 검증한다.
- 자동화가 민감 정보 없이 기능/문서/workflow 개선을 제안하고 병합하는 루프를 검증한다.

## 사용자 flow
1. 갤러리에서 장면을 선택한다.
2. 3D preview를 회전하며 분위기와 셰이더 반응을 확인한다.
3. 새로운 장면이나 시각 개선은 self-improve workflow가 PR로 제안한다.

## 실행 방법
```bash
pnpm install
pnpm dev
```

## 검증
```bash
pnpm check
```

## 자가 개선
```bash
pnpm self-improve:context
pnpm self-improve:guard
```

GitHub Actions의 `Self Improve` workflow는 GitHub Models를 사용해 작은 diff를 만들고, 민감 정보 guard와 `pnpm check`를 통과하면 `self-improve`, `automerge` 라벨 PR을 생성한 뒤 자동 squash merge한다.

## 디자인 시스템
- 기준 문서: `DESIGN.md`
- 실행 토큰: `src/design-system/base.css`
- 참고 기록: `docs/design/`

## 범위 밖
- 실제 API key나 배포 secret 저장
- 장기 운영용 대형 scene editor
- 외부 유료 모델/서비스에 종속되는 런타임 기능
