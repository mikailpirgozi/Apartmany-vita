# 🔧 Environment Variables Guide

Keďže `.env.example` je v `.gitignore`, tu je kompletný zoznam potrebných environment variables.

## 📋 Kompletný zoznam

```bash
# Port
PORT=3000

# Beds24 API
BEDS24_LONG_LIFE_TOKEN=your_token
BEDS24_ACCESS_TOKEN=your_token
BEDS24_REFRESH_TOKEN=your_token
BEDS24_BASE_URL=https://api.beds24.com/v2
BEDS24_PROP_ID_DESIGN=227484
BEDS24_ROOM_ID_DESIGN=483027
BEDS24_PROP_ID_LITE=168900
BEDS24_ROOM_ID_LITE=357932
BEDS24_PROP_ID_DELUXE=161445
BEDS24_ROOM_ID_DELUXE=357931

# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# NextAuth
NEXTAUTH_SECRET="your-secret-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="optional"
GOOGLE_CLIENT_SECRET="optional"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# Redis (Optional)
REDIS_URL="redis://localhost:6379"
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
REDIS_DB=0

# Vercel Blob
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# OpenAI (Optional)
OPENAI_API_KEY="sk-..."

# App Config
NODE_ENV=development
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-..."
SENTRY_DSN="https://..."
SENTRY_AUTH_TOKEN="..."

# Security
ADMIN_EMAILS="pirgozi1@gmail.com"
```

## 📝 Poznámky

1. Skopíruj `env.template` do `.env.local`
2. Vyplň potrebné hodnoty
3. NIKDY necommituj `.env.local` do git
4. Pre produkciu použi Railway/Vercel dashboard
