
export function useExternalRoute() {
  const { beforeEach } = useRouter()
  beforeEach((to, from, next) => {
    const full = to.fullPath.substring(1)
    if (full.startsWith('https:') || full.startsWith('http:')) {
      next(false)
      window.open(full, 'browser')
    } else {
      next()
    }
  })
}
