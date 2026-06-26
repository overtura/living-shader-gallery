import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const responsePath = process.argv[2]
if (!responsePath || !existsSync(responsePath)) {
  console.log('AI 응답 파일이 없어 변경 없이 종료합니다.')
  process.exit(0)
}

const response = readFileSync(responsePath, 'utf8')
const fenced = response.match(/```(?:diff|patch)?\s*([\s\S]*?)```/i)
const patch = (fenced ? fenced[1] : response).trim()

if (!patch.includes('diff --git') || !patch.includes('+++ b/')) {
  console.log('AI 응답에 적용 가능한 unified diff가 없어 변경 없이 종료합니다.')
  process.exit(0)
}

const forbiddenPath = /(^|\/)(\.env|\.npmrc|id_rsa|id_dsa|\.ssh|secrets?\.|credentials?|private-key|private_key)|\.(pem|p12|pfx|key)$/i
const paths = [...patch.matchAll(/^diff --git a\/(.+?) b\/(.+)$/gm)].flatMap((match) => [match[1], match[2]])
for (const path of paths) {
  if (forbiddenPath.test(path)) {
    throw new Error(`민감 파일 경로 변경 차단: ${path}`)
  }
}

const patchFile = join(tmpdir(), `self-improve-${Date.now()}.patch`)
writeFileSync(patchFile, `${patch}\n`)
execFileSync('git', ['apply', '--check', patchFile], { stdio: 'inherit' })
execFileSync('git', ['apply', patchFile], { stdio: 'inherit' })
console.log(`AI patch applied: ${[...new Set(paths)].join(', ')}`)
