import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()
const changed = new Set([
  ...git('diff', '--name-only').split('\n').filter(Boolean),
  ...git('diff', '--cached', '--name-only').split('\n').filter(Boolean),
  ...git('ls-files', '--others', '--exclude-standard').split('\n').filter(Boolean),
])

const forbiddenPath = /(^|\/)(\.env|\.npmrc|id_rsa|id_dsa|\.ssh|secrets?\.|credentials?|private-key|private_key)|\.(pem|p12|pfx|key)$/i
const secretPattern = /(ghp_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY|password\s*=\s*["'][^"']+["']|api[_-]?key\s*=\s*["'][^"']+["'])/
const dangerousWorkflowPattern = /(pull_request_target|id-token:\s*write|permissions:\s*write-all|contents:\s*write-all|secrets\.|curl\s+[^|]+\|\s*(sh|bash)|Invoke-Expression|Set-ExecutionPolicy)/i

for (const path of changed) {
  if (forbiddenPath.test(path)) {
    throw new Error(`민감 파일 경로 변경 차단: ${path}`)
  }

  if (!existsSync(path)) continue
  const content = readFileSync(path, 'utf8')
  if (secretPattern.test(content)) {
    throw new Error(`secret 패턴 감지로 변경 차단: ${path}`)
  }

  if (/^\.github\/workflows\/.+\.ya?ml$/i.test(path)) {
    if (dangerousWorkflowPattern.test(content)) {
      throw new Error(`위험한 workflow 패턴 감지로 변경 차단: ${path}`)
    }
  }
}

execFileSync('git', ['diff', '--check'], { stdio: 'inherit' })
console.log(changed.size === 0 ? '검사할 변경이 없습니다.' : `자가 개선 guard 통과: ${[...changed].join(', ')}`)
