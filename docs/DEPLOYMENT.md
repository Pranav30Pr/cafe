# Meeva Greens — Production Deployment Guide

This guide details the steps required to deploy the Meeva Greens cafe website and ordering platform to production on Vercel backed by Supabase.

---

## 1. Prerequisites

- **GitHub Repository**: Pushed and clean on `master` branch.
- **Vercel Account**: Linked to the GitHub organization/account.
- **Supabase Account**: Free or Pro tier project created.
- **Custom Domain**: `meevagreens.com` (DNS managed via Cloudflare, GoDaddy, or Namecheap).

---

## 2. Supabase Cloud Database Provisioning

1. Log in to [Supabase Console](https://supabase.com/dashboard) and create a new project:
   - **Name**: `meevagreens-prod`
   - **Region**: `ap-south-1` (Mumbai, India) for sub-20ms latency.
2. Navigate to **SQL Editor**:
   - Open and copy the contents of [`supabase/schema.sql`](../supabase/schema.sql).
   - Click **Run** to execute the schema (creates tables, sequences, RLS policies, and realtime publications).
   - Open and copy the contents of [`supabase/seed.sql`](../supabase/seed.sql).
   - Click **Run** to seed table configurations and default cafe settings.
3. Retrieve Project Credentials:
   - Navigate to **Project Settings** -> **API**.
   - Copy `Project URL`.
   - Copy `anon` `public` key.
   - Copy `service_role` `secret` key (keep strictly confidential).

---

## 3. Vercel Production Deployment

1. Import Project in Vercel:
   - Go to [vercel.com/new](https://vercel.com/new) and select the `cafe` repository.
   - Framework Preset: **Next.js**.
   - Root Directory: `./`.
2. Configure Environment Variables:
   Add the following variables in the Vercel dashboard:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   NEXT_PUBLIC_DEFAULT_TAX_RATE=0.00
   NEXT_PUBLIC_TAX_INCLUSIVE=false
   ```
3. Click **Deploy**. Vercel will build and deploy the application within ~60 seconds.

---

## 4. Custom Domain & DNS Mapping

1. In Vercel Project Settings -> **Domains**:
   - Add `meevagreens.com` and `www.meevagreens.com`.
2. Configure DNS Records with your registrar:
   - **A Record**: `@` points to `76.76.21.21`
   - **CNAME Record**: `www` points to `cname.vercel-dns.com`
3. SSL certificates (Let's Encrypt) are provisioned automatically by Vercel.

---

## 5. Thermal Receipt Printer Setup

1. Connect the 58mm or 80mm USB / Bluetooth thermal receipt printer to the Counter PC or tablet.
2. In the OS printer settings:
   - Set paper size to `58mm Roll` or `80mm Roll`.
   - Set margins to `None`.
3. In Chrome Print Dialog:
   - Destination: Select your thermal printer.
   - Headers and Footers: **Uncheck**.
   - Margins: **None**.
   - Scale: **100%** (or **Fit to printable area**).

---

## 6. Verification Checklist

- [ ] Visit `https://meevagreens.com` on a mobile browser; check responsive botanical hero and menu highlights.
- [ ] Visit `https://meevagreens.com/order/token-mg-t01-dinein`; place a test order with customer name and phone.
- [ ] Open `https://meevagreens.com/kitchen` on the kitchen tablet; verify audio chime triggers and ticket appears.
- [ ] Open `https://meevagreens.com/admin`; verify Table 1 is occupied and current bill is accurate.
- [ ] Complete counter settlement in `/admin`; verify invoice `MG-2026-XXXX` prints with 0% tax and table is freed.
