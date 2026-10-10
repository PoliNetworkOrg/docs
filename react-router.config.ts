import type { Config } from '@react-router/dev/config'
import { glob } from 'node:fs/promises'
import { createGetUrl, getSlugs } from 'fumadocs-core/source'
import { getPageMarkdownUrl } from './app/lib/shared'

const getUrl = createGetUrl('/docs')

export default {
  // PR previews are served from a subpath, see .github/workflows/preview.yaml
  basename: process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/` : '/',
  ssr: false,
  async prerender({ getStaticPaths }) {
    const paths: string[] = [...getStaticPaths()]

    for await (const entry of glob('**/*.mdx', { cwd: 'content/docs' })) {
      const slugs = getSlugs(entry)
      paths.push(getUrl(slugs), getPageMarkdownUrl({ slugs }).url)
    }

    return paths
  },
} satisfies Config
