import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const outDir = join(root, '.self-improvement')
mkdirSync(outDir, { recursive: true })

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))
const tryRead = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : '')
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()

const pkg = readJson(join(root, 'package.json'))
const project = readJson(join(root, 'self-improvement', 'project.json'))
const files = git('ls-files').split('\n').filter(Boolean)
const workflows = existsSync(join(root, '.github', 'workflows'))
  ? readdirSync(join(root, '.github', 'workflows')).filter((name) => name.endsWith('.yml') || name.endsWith('.yaml'))
  : []

const focus = process.env.SELF_IMPROVE_FOCUS || 'visual'
const instruction = process.env.SELF_IMPROVE_INSTRUCTION || ''
const recentCommits = git('log', '--oneline', '-8')
const status = git('status', '--short')
const backlog = tryRead(join(root, 'self-improvement', 'backlog.md')).slice(0, 5000)
const design = tryRead(join(root, 'DESIGN.md')).slice(0, 4000)
const readme = tryRead(join(root, 'README.md')).slice(0, 4000)

const summary = [
  `# ${project.name} self-improvement context`,
  '',
  `- focus: ${focus}`,
  `- instruction: ${instruction || '없음'}`,
  `- repository kind: ${project.kind}`,
  `- runtime: ${project.runtime}`,
  `- primary language: ${project.language || 'ko'}`,
  `- product goal: ${project.goal}`,
  `- allowed change scope: ${project.allowedChangeScope.join(', ')}`,
  `- blocked change scope: ${project.blockedChangeScope.join(', ')}`,
  `- quality gates: ${(project.qualityGates || ['pnpm check']).join(', ')}`,
  '',
  '## safe improvement backlog',
  backlog || '- backlog 없음',
  '',
  '## package scripts',
  '```json',
  JSON.stringify(pkg.scripts ?? {}, null, 2),
  '```',
  '',
  '## workflow files',
  workflows.map((name) => `- ${name}`).join('\n') || '- 없음',
  '',
  '## recent commits',
  recentCommits || '- 없음',
  '',
  '## working tree status before loop',
  status || '- clean',
  '',
  '## tracked files',
  files.slice(0, 240).map((name) => `- ${name}`).join('\n'),
  '',
  '## DESIGN.md excerpt',
  design || '- 없음',
  '',
  '## README excerpt',
  readme || '- 없음',
].join('\n')

writeFileSync(join(outDir, 'context.md'), summary)

const prompt = [
  summary,
  '',
  '## request',
  `이번 실행에서는 "${focus}" 관점에서 가장 작고 안전하며 검증 가능한 개선 하나만 수행하라.`,
  instruction ? `추가 지시사항: ${instruction}` : '추가 지시사항: 없음',
  '',
  '가능한 개선 예시:',
  '- 기능 기획/설계 루프: backlog, DESIGN.md, README, 샘플 데이터, 접근성 상태 문구 개선',
  '- visual/design 루프: 밝은 디자인 시스템 기준을 유지하는 작은 UI/CSS 개선',
  '- workflow 루프: 권한 상승 없이 guard, context, 문서, 검증 메시지 개선',
  '- accessibility/performance 루프: semantic markup, aria label, reduced motion, lazy/sizing 개선',
  '',
  '금지:',
  '- secret, 실제 토큰, credential, 개인 정보 추가',
  '- .env, .npmrc, private key, 인증서 파일 추가',
  '- 위험한 workflow 패턴 추가',
  '- 허용 범위를 벗어난 파일 수정',
  '- 한 번에 여러 기능을 크게 구현',
  '',
  '검증:',
  '- 변경 후 pnpm check가 통과해야 한다.',
  '- no-JS 프로젝트는 JavaScript runtime 파일을 추가하지 않는다.',
  '',
  '## output format',
  'unified git diff만 출력하라.',
  'diff --git a/path b/path',
  '--- a/path',
  '+++ b/path',
  '@@ ...',
].join('\n')

writeFileSync(join(outDir, 'prompt.md'), prompt)
console.log(`self-improvement context generated for ${project.name}`)
