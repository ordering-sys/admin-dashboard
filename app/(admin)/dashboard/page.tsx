import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/current-user'
import { ArrowRight, ArrowUpRight, Coffee, QrCode, Utensils, ChefHat, Users, Sparkles } from 'lucide-react'

export default async function DashboardPage() {
  const actor = await getCurrentUser()
  if (!actor) redirect('/auth/login')
  if (actor.role === 'chef') redirect('/kds')
  const cards = [
    { href: '/tables', icon: QrCode, title: 'Tables & QR codes', description: 'A seamless start to every visit. Create tables and prepare your ordering QR codes.', tag: 'GUEST EXPERIENCE', accent: 'amber' },
    ...(actor.role === 'admin' ? [
      { href: '/menu', icon: Utensils, title: 'Your menu, beautifully served', description: 'Update dishes, upload photos, and keep prices and availability fresh.', tag: 'MENU MANAGEMENT', accent: 'mint' },
      { href: '/kds', icon: ChefHat, title: 'Inside the kitchen', description: 'Follow incoming orders from the first ticket to the final finishing touch.', tag: 'LIVE OPERATIONS', accent: 'blue' },
      { href: '/users', icon: Users, title: 'The people behind it all', description: 'Create staff accounts and give every team member the access they need.', tag: 'YOUR TEAM', accent: 'amber' },
    ] : []),
  ]
  return <div className="admin-overview">
    <section className="admin-hero">
      <div className="admin-hero-copy"><span className="admin-eyebrow"><Sparkles size={14} /> YOUR DAILY BREW OF BUSINESS</span><h1>A good day starts<br />with a great café.</h1><p>Welcome to your workspace. A little attention to the details makes every guest experience better.</p><Link href={actor.role === 'admin' ? '/menu' : '/tables'} className="admin-primary">{actor.role === 'admin' ? 'Manage your menu' : 'Manage your tables'}<ArrowRight size={17} /></Link></div>
      <div className="admin-hero-art" aria-hidden="true"><span className="admin-orbit admin-orbit-one" /><span className="admin-orbit admin-orbit-two" /><div className="admin-coffee-emblem"><Coffee strokeWidth={1} /></div><span className="admin-art-caption">CRAFTED WITH CARE · SERVED WITH LOVE</span></div>
    </section>
    <div className="admin-section-heading"><div><span className="admin-eyebrow">THE EVERYDAY ESSENTIALS</span><h2>Everything in its place.</h2></div><span className="admin-section-note">Your café, at a glance</span></div>
    <div className="admin-action-grid">{cards.map(({ href, icon: Icon, title, description, tag, accent }) => <Link href={href} key={href} className={`admin-action-card accent-${accent}`}><div className="flex items-start justify-between"><span className="admin-action-icon"><Icon size={23} /></span><ArrowUpRight size={19} className="admin-card-arrow" /></div><span className="admin-card-tag">{tag}</span><h3>{title}</h3><p>{description}</p><span className="admin-card-cta">Open workspace <ArrowRight size={15} /></span></Link>)}</div>
    <section className="admin-getting-started"><div><span className="admin-eyebrow">FROM SETUP TO FIRST SIP</span><h2>Ready for your next guest?</h2><p>A few simple steps to bring your café online.</p></div><ol>{[
      ['Prepare your tables', 'Add a table and generate its unique QR code.'],
      ['Set the scene', 'Print and place a QR code where guests can scan it.'],
      ['Let the good times flow', 'Guests browse the menu; your team takes it from there.'],
    ].map(([title, text], index) => <li key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></section>
  </div>
}
