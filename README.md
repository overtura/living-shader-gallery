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

`pnpm check`는 lint, typecheck, vitest, production build를 순서대로 실행한다. 시각 변경 PR은 이 명령 통과와 함께 desktop/mobile에서 3D canvas가 비어 있지 않은지도 확인한다.

## Vercel 배포
- 배포 설정: `vercel.json`
- framework: Vite
- build command: `pnpm build`
- output directory: `dist`
- production deploy: Vercel CLI 로그인 또는 `VERCEL_TOKEN` 설정 후 `npx vercel --prod --yes`

현재 저장소는 Vercel 정적 배포 설정까지 준비되어 있다. 이 Codex 실행 환경에서는 Vercel CLI/커넥터 인증이 확인되지 않아 production URL 발급은 인증 후 진행한다.

## 최근 업데이트
- 밝은 톤 디자인 시스템과 `src/design-system/base.css` 기준을 적용했다.
- 셰이더 장면 선택과 시각 표현을 작은 PR 단위로 개선하는 자가 개선 루프를 검증했다.
- 중앙 maintainer bot은 레포별 profile, 최근 PR 이력, 전후 캡처 정책을 기준으로 독립적인 개선 후보를 찾는다.

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
