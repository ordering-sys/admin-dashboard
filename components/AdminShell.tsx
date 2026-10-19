'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useSyncExternalStore, type ReactNode } from 'react'
import { ArrowUpRight, ChefHat, Coffee, LayoutDashboard, Menu, Moon, QrCode, Sun, Users, Utensils, X } from 'lucide-react'
import { LogoutButton } from '@/components/LogoutButton'
import { canAccess, type Role } from '@/lib/roles'

const links = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/menu', label: 'Menu items', icon: Utensils },
  { href: '/tables', label: 'Tables & QR', icon: QrCode },
  { href: '/kds', label: 'Kitchen display', icon: ChefHat },
  { href: '/users', label: 'Team members', icon: Users },
]
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener('admin-theme-change', callback)
  return () => { window.removeEventListener('storage', callback); window.removeEventListener('admin-theme-change', callback) }
}
function getTheme() {
  try { return localStorage.getItem('cafe-admin-theme') === 'light' ? 'light' : 'dark' } catch { return 'dark' }
}

export function AdminShell({ children, role, siteUrl }: { children: ReactNode; role: Role; siteUrl: string }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [overrideTheme, setOverrideTheme] = useState<'light' | 'dark' | null>(null)
  const savedTheme = useSyncExternalStore(subscribe, getTheme, () => 'dark')
  const theme = overrideTheme ?? savedTheme
  const current = links.find(link => pathname === link.href || pathname.startsWith(`${link.href}/`))
  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setOverrideTheme(next)
    try { localStorage.setItem('cafe-admin-theme', next); window.dispatchEvent(new Event('admin-theme-change')) } catch { /* Use the in-memory preference when storage is unavailable. */ }
  }
  return <div className="admin-workspace" data-theme={theme} onKeyDown={event => { if (event.key === 'Escape') setMobileOpen(false) }}>
    <a href="#admin-content" className="admin-skip">Skip to content</a>
    {mobileOpen && <button className="admin-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <aside id="admin-navigation" className={`admin-sidebar ${mobileOpen ? 'is-open' : ''}`} aria-label="Admin navigation">
      <button className="admin-drawer-close admin-icon-button" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={18} /></button>
      <Link href={role === 'chef' ? '/kds' : '/dashboard'} className="admin-brand" onClick={() => setMobileOpen(false)}><span className="admin-brand-icon"><Coffee size={25} /></span><span><strong>The Bean Haven</strong><small>MANAGEMENT STUDIO</small></span></Link>
      <div className="admin-sidebar-label">WORKSPACE</div>
      <nav className="admin-nav">{links.filter(link => canAccess(role, link.href)).map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`)
        return <Link key={href} href={href} onClick={() => setMobileOpen(false)} aria-current={active ? 'page' : undefined} className={`admin-nav-link ${active ? 'is-active' : ''}`}><Icon size={19} /><span>{label}</span>{active && <span className="admin-active-dot" />}</Link>
      })}</nav>
      <div className="admin-sidebar-note"><span className="admin-eyebrow">A LITTLE CARE, EVERY DAY</span><p>Good coffee.<br />Great experiences.</p><small>Your café, thoughtfully managed.</small></div>
      <div className="admin-profile"><span className="admin-avatar">{role.slice(0, 1).toUpperCase()}</span><div><strong className="capitalize">{role}</strong><small>Staff workspace</small></div><LogoutButton /></div>
    </aside>
    <div className="admin-body">
      <header className="admin-topbar"><div className="flex items-center gap-3"><button className="admin-icon-button admin-mobile-toggle" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} aria-controls="admin-navigation" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button><span className="admin-breadcrumb">Workspace <span>/</span> <strong>{current?.label ?? 'Admin'}</strong></span></div>
        <div className="flex items-center gap-3"><span className="admin-role capitalize">{role}</span><button className="admin-icon-button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</button><a href={siteUrl} target="_blank" rel="noopener noreferrer" className="admin-site-link">View café <ArrowUpRight size={16} /></a></div>
      </header>
      <main id="admin-content" tabIndex={-1} className="admin-content">{children}</main>
      <footer className="admin-footer"><span>Café · Made for the everyday details.</span><span>Staff workspace</span></footer>
    </div>
  </div>
}
