/**
 * Prefix a root-relative path with the base path (set in PR previews).
 * Only needed for plain URLs: React Router links add the basename themselves.
 */
export function withBase(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
