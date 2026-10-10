import { defineConfig } from 'fumadocs-mdx/config'
import { rehypeCodeDefaultOptions, remarkMdxMermaid } from 'fumadocs-core/mdx-plugins'
import { transformerNotationErrorLevel } from '@shikijs/transformers'

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkMdxMermaid],
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        // `# [!code error]` marks a line as wrong
        transformerNotationErrorLevel({ matchAlgorithm: 'v3' }),
      ],
    },
  },
})
