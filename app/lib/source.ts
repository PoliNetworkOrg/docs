import { createElement } from 'react'
import { Archive, Server } from 'lucide-react'
import { llms, loader } from 'fumadocs-core/source'
import { defineDocs } from 'fumadocs-mdx/macro'
import { docsRoute } from './shared'

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    async: true,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
})

// icons named in meta.json files
const icons = { Archive, Server }

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: docsRoute,
  icon(name) {
    if (name && name in icons) return createElement(icons[name as keyof typeof icons])
  },
})

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText('processed')}`,
})
