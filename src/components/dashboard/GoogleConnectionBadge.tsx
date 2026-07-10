import Link from 'next/link'
import { cn } from '@/lib/utils'

// Status pill for the ScoreMax business Google account. Renders as a link
// when `href` is given (e.g. the sidebar linking to settings).
export function GoogleConnectionBadge({
  connected,
  href,
  title,
  className,
}: {
  connected: boolean
  href?: string
  title?: string
  className?: string
}) {
  const classes = cn(
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
    connected ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
    href && 'transition-colors',
    href && (connected ? 'hover:bg-emerald-100' : 'hover:bg-amber-100'),
    className
  )
  const content = (
    <>
      <span className={cn('h-1.5 w-1.5 rounded-full', connected ? 'bg-emerald-500' : 'bg-amber-500')} />
      {connected ? 'Google Connected' : 'Google Disconnected'}
    </>
  )

  if (href) {
    return (
      <Link href={href} title={title} className={classes}>
        {content}
      </Link>
    )
  }
  return (
    <span title={title} className={classes}>
      {content}
    </span>
  )
}
