// Turn the React Router output into a plain static site in build/, which is
// what the deploy and preview workflows publish.
import { cp, readdir, rename, rm } from 'node:fs/promises'

const out = 'build'
const client = `${out}/client`
const base = process.env.PUBLIC_URL?.replace(/^\/|\/$/g, '')

// With a basename (PR previews), React Router prerenders the pages into
// build/client/<basename>/ while the assets stay in build/client/. The preview
// action uploads the site to the basename path itself, so move the pages back
// to the root.
if (base) {
  await cp(`${client}/${base}`, client, { recursive: true, force: true })
  await rm(`${client}/${base.split('/')[0]}`, { recursive: true })
}

// GitHub Pages serves 404.html for unknown URLs: let the client router render
// the not-found page. There is no fallback page in PR previews.
const entries = await readdir(client)
if (entries.includes('__spa-fallback.html')) {
  await cp(`${client}/__spa-fallback.html`, `${client}/404.html`)
}

// The server build is only used for prerendering.
await rm(`${out}/server`, { recursive: true, force: true })
for (const entry of await readdir(client)) {
  await rename(`${client}/${entry}`, `${out}/${entry}`)
}
await rm(client, { recursive: true })
