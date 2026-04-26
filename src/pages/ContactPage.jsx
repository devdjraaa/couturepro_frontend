import { Mail, MessageCircle, Globe, Phone } from 'lucide-react'
import { AppLayout } from '@/components/layout'

const CONTACTS = [
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+225 07 00 00 00 00',
    href: 'https://wa.me/2250700000000',
    color: 'bg-green-500/10 text-green-600',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'support@couturepro.app',
    href: 'mailto:support@couturepro.app',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Globe,
    label: 'Site web',
    value: 'couturepro.app',
    href: 'https://couturepro.app',
    color: 'bg-accent/10 text-accent-600',
  },
]

export default function ContactPage() {
  return (
    <AppLayout title="Contact" showBack>
      <div className="p-4 space-y-4">
        <p className="text-sm text-dim text-center py-2">
          Notre équipe est disponible pour vous aider du lundi au vendredi, de 8h à 18h.
        </p>

        {CONTACTS.map(c => (
          <a
            key={c.label}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-card border border-edge rounded-2xl p-4 active:opacity-70 transition-opacity"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.color}`}>
              <c.icon size={18} />
            </div>
            <div>
              <p className="text-xs text-dim">{c.label}</p>
              <p className="text-sm font-medium text-ink mt-0.5">{c.value}</p>
            </div>
          </a>
        ))}

        <div className="bg-card border border-edge rounded-2xl p-4 mt-2">
          <p className="text-xs text-dim text-center leading-relaxed">
            Pour les problèmes urgents, privilégiez le contact WhatsApp.
            Pour les questions techniques ou les remboursements, utilisez l'email.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
