import type { ReactNode } from 'react'
import { CalloutContainer, CalloutDescription, CalloutTitle } from 'fumadocs-ui/components/callout'
import { CircleAlert, Info, Lightbulb } from 'lucide-react'

// Same filled style as the Fumadocs icons
const iconClass = 'size-5 -me-0.5 fill-(--callout-color) text-fd-card'

// Docusaurus admonition types on top of the Fumadocs callout. `color` is the
// Fumadocs color the callout is tinted with; `icon` replaces its default one.
const types = {
  note: { fumadocs: 'info', color: 'var(--color-fd-muted-foreground)', icon: <Info className={iconClass} /> },
  tip: { fumadocs: 'success', color: 'var(--color-fd-success)', icon: <Lightbulb className="size-5 -me-0.5 fill-(--callout-color) text-(--callout-color)" /> },
  info: { fumadocs: 'info', color: 'var(--color-fd-info)' },
  important: { fumadocs: 'info', color: 'var(--color-fd-primary)', icon: <CircleAlert className={iconClass} /> },
  warning: { fumadocs: 'warning', color: 'var(--color-fd-warning)' },
  caution: { fumadocs: 'warning', color: 'var(--color-fd-warning)' },
  danger: { fumadocs: 'error', color: 'var(--color-fd-error)' },
} as const

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
  const config: { fumadocs: string; color: string; icon?: ReactNode } = types[resolved]

  return (
    <CalloutContainer
      type={config.fumadocs as 'info'}
      icon={config.icon}
      className="callout"
      style={{ '--callout-color': config.color } as React.CSSProperties}
    >
      {title && <CalloutTitle>{title}</CalloutTitle>}
      <CalloutDescription>{children}</CalloutDescription>
    </CalloutContainer>
  )
}
