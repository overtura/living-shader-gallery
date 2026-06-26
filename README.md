# Living Shader Gallery

React Three Fiber 기반의 인터랙티브 셰이더 갤러리입니다. 각 장면은 작은 컴포넌트로 분리하고, 중앙 `okorion/self-improving-maintainer-bot` control plane이 target profile을 통해 새 장면, 시각 개선, 문서 개선을 PR로 제안하도록 세팅합니다.

## 목적
- 셰이더, 입자, 후처리, 카메라 인터랙션을 빠르게 실험한다.
- PR마다 시각 결과와 성능 리스크를 작게 검증한다.
- 자동화가 민감 정보 없이 기능/문서 개선을 제안하는 PR 루프를 검증한다.

## 사용자 flow
1. 갤러리에서 장면을 선택한다.
2. 3D preview를 회전하며 분위기와 셰이더 반응을 확인한다.
3. 새로운 장면이나 시각 개선은 중앙 maintainer bot이 target profile 기반 PR로 제안한다.

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
이 저장소에는 자가 개선 엔진을 두지 않는다. 중앙 control plane인 `okorion/self-improving-maintainer-bot`이 `profiles/overtura/living-shader-gallery.json` profile로 이 저장소를 target repo로 다룬다.

Target 설정은 `maintainer-bot/`에 둔다. `.github/workflows/**`, credential, auth/security, infra, migration 변경은 R3로 취급하며 draft/proposal only로 처리한다.

## 디자인 시스템
- 기준 문서: `DESIGN.md`
- 실행 토큰: `src/design-system/base.css`
- 참고 기록: `docs/design/`

## 범위 밖
- 실제 API key나 배포 secret 저장
- 장기 운영용 대형 scene editor
- 외부 유료 모델/서비스에 종속되는 런타임 기능
