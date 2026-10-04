# BoutiqueOS

A high-fidelity iOS-first luxury fashion order management prototype for boutique staff. Manage custom orders placed with external fashion designers, track production, and communicate via email — all in one premium internal operations tool.

## Overview

BoutiqueOS is designed for luxury boutiques that act as intermediaries between customers and fashion designers (e.g., Manish Malhotra, Sabyasachi, Anita Dongre). It centralizes the complete order lifecycle from creation through delivery.

**This is a clickable prototype** with realistic mock data, prepared for Supabase integration.

## Features

- **Orders Dashboard** — Search, filter, swipe actions, order cards
- **Create Order Wizard** — 4-step flow (Product → Customer → Measurements → Review)
- **Order Details** — Full order view with timeline, notes, attachments
- **Designer Management** — Add, edit, archive designers
- **Email Workflow** — Native iOS mail composer with pre-filled order details
- **Settings** — Boutique info, email templates, notifications

## Tech Stack

- React Native + Expo (SDK 56)
- TypeScript
- Expo Router (file-based navigation)
- Supabase (architecture prepared, mock data for prototype)
- expo-mail-composer, expo-image-picker

## Getting Started

```bash
cd BoutiqueOS
npm install
npm run ios
```

For Android or web:

```bash
npm run android
npm run web
```

## Project Structure

```
app/                    # Expo Router screens
  (tabs)/               # Orders, Designers, Settings
  order/                # Create order, order details
  designer/             # Add/edit designer
components/             # Reusable UI and feature components
context/                # App state (mock data provider)
data/                   # Mock seed data
lib/                    # Supabase client, email utilities
supabase/               # Database schema SQL
types/                  # TypeScript definitions
constants/              # Theme, colors, spacing
utils/                  # Helpers and formatters
```

## Design System

- White theme only (Apple HIG inspired)
- SF Pro typography (system font on iOS)
- 8-point spacing grid
- Colors: `#111111` primary, `#666666` secondary, `#EAEAEA` borders

## Supabase Integration

The schema is defined in `supabase/schema.sql`. To connect:

1. Create a Supabase project
2. Run the schema SQL
3. Copy `.env.example` to `.env` and add your credentials
4. Replace mock context with Supabase queries

## Prototype Scope

Included: order management, status tracking, designer CRUD, email composer, measurements, attachments, notes.

Not included: authentication, payments, inventory, shipping integrations, customer/designer accounts, marketplace features.

## License

Private — Maison Élégance prototype for stakeholder demonstrations.
