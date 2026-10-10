# PoliNetwork Docs

Welcome to the PoliNetwork documentation site. Here you will find guides, tutorials,
and other resources to help you get started with contributing to PoliNetwork's projects.

## Website

This website is built with [Fumadocs](https://fumadocs.dev/) on
[React Router](https://reactrouter.com/), and exported as a static site.

### Installation

```sh
pnpm install
```

### Local Development

```sh
pnpm dev
```

This command starts a local development server. Most changes are reflected live without having to restart the server.

### Build

```sh
pnpm build
```

This command prerenders every page into the `build` directory, which can be served using any static contents hosting service.

You can then serve your static build by running:

```sh
pnpm start
```

### Deployment

This website is deployed using GitHub Pages. The deployment process is automated using GitHub Actions,
and every pull request gets a preview deployment.

## Writing docs

Pages live in `content/docs/` as `.mdx` files: the URL follows the file path
(`content/docs/infrastructure/Guides/backups.mdx` is `/docs/infrastructure/Guides/backups`).

- Every page needs a `title` in its front matter (and optionally a `description`): it is
  rendered as the page heading, so don't repeat it as a `#` heading.
- The sidebar order and folder names come from the `meta.json` file in each folder.
- Link to other pages with their URL, e.g. `[Backups](/docs/infrastructure/Guides/backups)`.
- Callouts: `<Callout type="note|tip|info|important|warning|caution|danger" title="Optional title">...</Callout>`.
- Code blocks take a `title="file.yaml"` and `lineNumbers`. Mark lines with a comment at the
  end of the line, or alone on the line before them with a line count:
  `# [!code ++]` (added), `# [!code --]` (removed), `# [!code highlight]`, `# [!code error]`,
  e.g. `# [!code ++:3]` marks the next 3 lines as added.
- ` ```mermaid ` code blocks are rendered as diagrams.
