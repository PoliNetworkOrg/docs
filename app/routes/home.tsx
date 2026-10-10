import type { ReactNode } from 'react'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
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

const features: { title: string; image: string; description: ReactNode }[] = [
  {
    title: 'Powered by Azure',
    image: '/img/azure.svg',
    description: (
      <>
        We run all our services on Microsoft Azure, thanks to the Microsoft Sponsorship for
        Nonprofits.{' '}
        <a href="https://nonprofit.microsoft.com/it-it" target="_blank" rel="noreferrer">
          Learn more
        </a>
        .
      </>
    ),
  },
  {
    title: '100% Open Source',
    image: '/img/oss.svg',
    description: (
      <>
        We are very serious about Open Source. All our projects are fully open source and
        available on GitHub. Freedom of information is a core value for us, we even wrote it in
        our{' '}
        <a
          href="https://raw.githubusercontent.com/PoliNetworkOrg/Statuto/document/Document.pdf"
          target="_blank"
          rel="noreferrer"
        >
          Statute
        </a>
        , and this will never change.
      </>
    ),
  },
  {
    title: 'By Students, For Students',
    image: '/img/logo.svg',
    description: (
      <>
        PoliNetwork is a student association, and we are all students. Our main goal is to
        improve campus life and empower students communications. If you want to contribute to our
        vision, join us on{' '}
        <a href="https://t.me/+C2Qb3SVo5qQwMzRk" target="_blank" rel="noreferrer">
          Telegram
        </a>
        !
      </>
    ),
  },
]

const footerLinks: { title: string; items: { label: string; href: string }[] }[] = [
  {
    title: 'Docs',
    items: [
      { label: 'Introduction', href: '/docs/intro' },
      { label: 'Infrastructure', href: '/docs/infrastructure/Introduction' },
      { label: 'Archived Projects 🗃️', href: '/docs/archive' },
    ],
  },
  {
    title: 'Main Links',
    items: [
      { label: 'Main Site', href: 'https://polinetwork.org' },
      { label: 'GitHub', href: 'https://github.com/polinetworkorg' },
    ],
  },
  {
    title: 'Community',
    items: [
      { label: 'Main Telegram Group', href: 'https://t.me/poligruppo' },
      { label: 'Projects Telegram Group', href: 'https://t.me/+C2Qb3SVo5qQwMzRk' },
      { label: 'Instagram', href: 'https://www.instagram.com/polinetwork_/' },
    ],
  },
]

export default function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="flex flex-1 flex-col">
        <section className="bg-fd-primary px-4 py-16 text-center text-fd-primary-foreground sm:py-24">
          <h1 className="text-4xl font-bold sm:text-5xl">{appName}</h1>
          <p className="mt-4 text-lg opacity-90 sm:text-xl">
            Technical Documentation for PoliNetwork
          </p>
          <Link
            to="/docs/intro"
            className="mt-8 inline-block rounded-lg bg-fd-background px-6 py-3 font-semibold text-fd-foreground transition-opacity hover:opacity-90"
          >
            Get Started
          </Link>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="text-center">
              <img src={withBase(feature.image)} alt="" className="mx-auto h-40 w-40" />
              <h3 className="mt-6 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-3 text-fd-muted-foreground [&_a]:text-fd-primary [&_a]:underline">
                {feature.description}
              </p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t bg-fd-card px-6 py-12 text-sm">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
          {footerLinks.map((group) => (
            <div key={group.title}>
              <p className="mb-3 font-semibold">{group.title}</p>
              <ul className="space-y-2 text-fd-muted-foreground">
                {group.items.map((item) => (
                  <li key={item.label}>
                    {item.href.startsWith('/') ? (
                      <Link to={item.href} className="hover:text-fd-foreground">
                        {item.label}
                      </Link>
                    ) : (
                      <a href={item.href} className="hover:text-fd-foreground">
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-fd-muted-foreground">
          Copyright © {new Date().getFullYear()} PoliNetwork APS
        </p>
      </footer>
    </HomeLayout>
  )
}
