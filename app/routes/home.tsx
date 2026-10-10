import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { useSearchContext } from 'fumadocs-ui/contexts/search'
import { ArrowRight, Search } from 'lucide-react'
import { Link } from 'react-router'
import { baseOptions } from '@/lib/layout.shared'
import { withBase } from '@/lib/base-url'
import { appName } from '@/lib/shared'

export function meta() {
  return [
    { title: appName },
    { name: 'description', content: 'La documentazione ufficiale di PoliNetwork' },
  ]
}

const sections = [
  {
    title: 'Infrastructure',
    description: 'Azure, the K3s node, Flux and the CI/CD pipelines.',
    href: '/docs/infrastructure/Introduction',
  },
  {
    title: 'Guides',
    description: 'Deploy an app, add secrets and storage, restore backups.',
    href: '/docs/infrastructure/Guides/deploy-a-new-app',
  },
  {
    title: 'Archived Projects',
    description: 'Documentation of retired projects, kept for reference.',
    href: '/docs/archive',
  },
]

const links = [
  { label: 'polinetwork.org', href: 'https://polinetwork.org' },
  { label: 'GitHub', href: 'https://github.com/polinetworkorg' },
  { label: 'Telegram', href: 'https://t.me/+C2Qb3SVo5qQwMzRk' },
  { label: 'Instagram', href: 'https://www.instagram.com/polinetwork_/' },
]

function SearchButton() {
  const { setOpenSearch, hotKey } = useSearchContext()

  return (
    <button
      type="button"
      onClick={() => setOpenSearch(true)}
      className="inline-flex h-11 w-full items-center gap-2 rounded-lg border bg-fd-card px-4 text-fd-muted-foreground transition-colors hover:border-fd-primary/40 hover:text-fd-foreground sm:w-64"
    >
      <Search className="size-4" aria-hidden />
      Search the docs
      <span className="ms-auto inline-flex gap-0.5">
        {hotKey.map((key, i) => (
          <kbd key={i} className="rounded-md border bg-fd-background px-1.5 font-sans text-xs">
            {key.display}
          </kbd>
        ))}
      </span>
    </button>
  )
}

export default function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="relative flex flex-1 flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-fd-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-fd-border)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_55%_at_50%_42%,black,transparent)]"
        />

        <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-6 sm:py-12">
          <img src={withBase('/img/logo.svg')} alt="" className="hidden size-14 sm:block" />
          <h1 className="max-w-3xl text-[2rem] leading-tight font-semibold tracking-tight text-balance sm:mt-8 sm:text-6xl sm:leading-none">
            Technical documentation for PoliNetwork
          </h1>

          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row">
            <Link
              to="/docs/infrastructure/Introduction"
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-fd-primary px-5 font-medium text-fd-primary-foreground transition-[filter,scale] hover:brightness-110 active:scale-[0.98]"
            >
              Get started
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
            <SearchButton />
          </div>

          <nav className="mt-8 grid gap-2 sm:mt-14 sm:grid-cols-3 sm:gap-3">
            {sections.map((section) => (
              <Link
                key={section.href}
                to={section.href}
                className="group rounded-xl border bg-fd-card/80 px-4 py-3 backdrop-blur-sm sm:p-5 transition-colors hover:border-fd-primary/40"
              >
                <p className="flex items-center justify-between font-medium">
                  {section.title}
                  <ArrowRight
                    className="size-4 text-fd-muted-foreground transition-[translate,color] group-hover:translate-x-0.5 group-hover:text-fd-primary"
                    aria-hidden
                  />
                </p>
                <p className="mt-1.5 hidden text-sm text-fd-muted-foreground sm:block">
                  {section.description}
                </p>
              </Link>
            ))}
          </nav>
        </section>

        <footer className="mx-auto flex w-full max-w-5xl flex-col-reverse gap-2 border-t px-6 py-4 text-sm sm:py-5 text-fd-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} PoliNetwork APS</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition-colors hover:text-fd-foreground">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </footer>
      </div>
    </HomeLayout>
  )
}
