import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
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
const summary = [
  `# ${project.name} 자가 개선 컨텍스트`,
  '',
  `- 초점: ${focus}`,
  `- 저장소 유형: ${project.kind}`,
  `- 런타임: ${project.runtime}`,
  `- 기본 언어: 한국어`,
  `- 제품 목표: ${project.goal}`,
  `- 허용 변경 범위: ${project.allowedChangeScope.join(', ')}`,
  `- 금지 변경 범위: ${project.blockedChangeScope.join(', ')}`,
  '',
  '## package scripts',
  '```json',
  JSON.stringify(pkg.scripts ?? {}, null, 2),
  '```',
  '',
  '## workflow files',
  workflows.map((name) => `- ${name}`).join('\n') || '- 없음',
  '',
  '## tracked files',
  files.slice(0, 220).map((name) => `- ${name}`).join('\n'),
  '',
  '## README excerpt',
  tryRead(join(root, 'README.md')).slice(0, 4000),
].join('\n')

writeFileSync(join(outDir, 'context.md'), summary)

const prompt = [
  summary,
  '',
  '## 요청',
  `이번 실행에서는 "${focus}" 관점에서 가장 작고 안전한 개선 하나만 수행하라.`,
  '가능한 개선 예: 한국어 문구 보강, 접근성 속성 추가, CSS 정리, 데모 데이터 정리, 안전한 workflow 개선, README 정확도 개선.',
  '런타임 secret, 실제 외부 API 키, 배포 credential, 사용자 개인정보는 절대 추가하지 말라.',
  'pnpm check가 통과하도록 변경하라.',
  '',
  '## 출력 형식',
  'unified git diff만 출력하라. 예:',
  'diff --git a/path b/path',
  '--- a/path',
  '+++ b/path',
  '@@ ...',
].join('\n')

writeFileSync(join(outDir, 'prompt.md'), prompt)
console.log(`self-improvement context generated for ${project.name}`)
