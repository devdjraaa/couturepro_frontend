import { z } from 'zod'

const telephone = z
  .string()
  .min(8, 'Numéro trop court')
  .regex(/^[0-9+\s()\-]+$/, 'Numéro invalide')

const motDePasse = z.string().min(8, 'Minimum 8 caractères')

// ── Auth ──
export const loginSchema = z.object({
  telephone,
  password: z.string().min(1, 'Mot de passe requis'),
})

export const registerSchema = z
  .object({
    prenom:               z.string().min(2, 'Prénom requis'),
    nom:                  z.string().min(2, 'Nom requis'),
    telephone,
    nom_atelier:          z.string().min(2, "Nom de l'atelier requis"),
    password:             motDePasse,
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['password_confirmation'],
  })

export const otpSchema = z.object({
  code: z.string().length(6, 'Code à 6 chiffres'),
})

// ── Clients ──
export const clientSchema = z.object({
  prenom:      z.string().min(2, 'Prénom requis'),
  nom:         z.string().min(2, 'Nom requis'),
  telephone,
  email:       z.string().email('Email invalide').optional().or(z.literal('')),
  type_profil: z.enum(['vip', 'regulier', 'occasionnel']),
  notes:       z.string().optional(),
})

// ── Commandes ──
export const commandeSchema = z.object({
  client_id:      z.string().min(1, 'Client requis'),
  vetement_id:    z.string().min(1, 'Vêtement requis'),
  date_livraison: z.string().min(1, 'Date de livraison requise'),
  montant:        z.number({ invalid_type_error: 'Montant invalide' }).positive('Montant invalide'),
  avance:         z.number().min(0).optional(),
  notes:          z.string().optional(),
})

// ── Vêtements ──
export const vetementSchema = z.object({
  nom:         z.string().min(2, 'Nom requis'),
  description: z.string().optional(),
  libelles:    z.array(z.string()).min(1, 'Au moins une mesure requise'),
})

// ── Équipe ──
export const membreSchema = z.object({
  prenom:    z.string().min(2, 'Prénom requis'),
  nom:       z.string().min(2, 'Nom requis'),
  telephone,
  role:      z.enum(['assistant', 'membre']),
})

// ── Abonnement ──
export const codeActivationSchema = z.object({
  code: z
    .string()
    .min(1, 'Code requis')
    .transform((v) => v.replace(/\s|-/g, '').toUpperCase()),
})

// ── Profil ──
export const profilSchema = z.object({
  prenom:    z.string().min(2, 'Prénom requis'),
  nom:       z.string().min(2, 'Nom requis'),
  telephone,
  email:     z.string().email('Email invalide').optional().or(z.literal('')),
})
