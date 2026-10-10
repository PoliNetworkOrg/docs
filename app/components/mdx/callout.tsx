import type { ReactNode } from 'react'
import { CircleAlert, Flame, Info, Lightbulb, NotebookPen, TriangleAlert } from 'lucide-react'

// Docusaurus-style admonitions; the Fumadocs type names are accepted as aliases.
const types = {
  note: { label: 'Note', icon: NotebookPen },
  tip: { label: 'Tip', icon: Lightbulb },
  info: { label: 'Info', icon: Info },
  important: { label: 'Important', icon: CircleAlert },
  warning: { label: 'Warning', icon: TriangleAlert },
  caution: { label: 'Caution', icon: TriangleAlert },
  danger: { label: 'Danger', icon: Flame },
}

const aliases = {
  idea: 'tip',
  success: 'tip',
  warn: 'warning',
  error: 'danger',
} as const satisfies Record<string, keyof typeof types>

export type CalloutType = keyof typeof types | keyof typeof aliases

export function Callout({
  type = 'note',
  title,
  children,
}: {
  type?: CalloutType
  title?: ReactNode
  children?: ReactNode
}) {
  const resolved = type in aliases ? aliases[type as keyof typeof aliases] : (type as keyof typeof types)
  const { label, icon: Icon } = types[resolved]

  return (
    <div className="callout my-6 rounded-lg px-5 py-4" data-type={resolved}>
      <p className="callout-title not-prose flex items-center gap-2 text-sm font-bold tracking-wide uppercase">
        <Icon className="size-4.5" aria-hidden />
        {title ?? label}
      </p>
      <div className="mt-2 [&>:first-child]:mt-0 [&>:last-child]:mb-0">{children}</div>
    </div>
  )
}
