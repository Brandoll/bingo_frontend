import type { PropsWithChildren, ReactNode } from 'react'
import { Logo } from '../ui/Logo'

export function PageShell({ children, action }: PropsWithChildren<{ action?: ReactNode }>) {
  return (
    <div className="page-shell">
      <header className="site-header container">
        <Logo />
        {action}
      </header>
      <main>{children}</main>
    </div>
  )
}
