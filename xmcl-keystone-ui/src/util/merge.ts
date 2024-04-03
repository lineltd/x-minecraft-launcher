export function merge<T>(first: T[], second: T[]) {
  const result: T[] = []
  for (let i = 0; i < Math.max(first.length, second.length); i++) {
    const m = first[i]
    const c = second[i]
    if (m) result.push(m)
    if (c) result.push(c)
  }
  return result
}
