export const appName = 'PoliNetwork Docs'
export const docsRoute = '/docs'
export const docsContentRoute = '/llms.mdx/docs'

export const gitConfig = {
  user: 'polinetworkorg',
  repo: 'docs',
  branch: 'main',
}

export function getPageMarkdownUrl(page: { slugs: string[] }) {
  const segments = [...page.slugs, 'content.md']
  return { segments, url: `${docsContentRoute}/${segments.join('/')}` }
}
