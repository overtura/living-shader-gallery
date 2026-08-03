let cachedWebGLSupport: boolean | undefined

export function isWebGLAvailable() {
  if (cachedWebGLSupport !== undefined) return cachedWebGLSupport
  if (typeof document === 'undefined') return true

  try {
    const probe = document.createElement('canvas')
    const context = probe.getContext('webgl2')
    const isSupported = context !== null

    context?.getExtension('WEBGL_lose_context')?.loseContext()
    cachedWebGLSupport = isSupported
    return isSupported
  } catch {
    cachedWebGLSupport = false
    return false
  }
}
