import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { appName, gitConfig } from './shared'
import { withBase } from './base-url'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <img src={withBase('/img/logo.png')} alt="" className="size-6" />
          {appName}
        </>
      ),
    },
    links: [
      { text: 'Infrastructure', url: '/docs/infrastructure/Introduction', active: 'nested-url' },
      { text: 'Archived Projects 🗃️', url: '/docs/archive', active: 'nested-url' },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  }
}
