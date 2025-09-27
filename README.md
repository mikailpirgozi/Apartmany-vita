# 🏠 Apartmány Vita - Modern Booking Platform

> **Moderná rezervačná platforma pre Apartmány Vita v Trenčíne**

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

---

## 🌟 Features

### 🔐 **Kompletná Autentifikácia**
- **Google OAuth** + Email/Password prihlasenie
- **3-tier Loyalty Program** (5%, 7%, 10% zľavy)
- **User Dashboard** s štatistikami a profilom
- **Session Management** s NextAuth.js

### 🏠 **Apartmánový Systém**
- **4 Apartmány** (Malý, Design, Lite, Deluxe)
- **Responsive Gallery** s lightbox navigáciou
- **Detailné informácie** (rozloha, kapacita, vybavenie)
- **SEO Optimalizácia** s metadata

### 📅 **Rezervačný Systém**
- **Booking Widget** s cenovou kalkuláciou
- **Date Picker** s validáciou
- **Guest Selector** s limitmi
- **Dynamic Pricing** s loyalty zľavami

### 🌍 **Pokročilé Funkcie**
- **5-jazyková podpora** (SK, EN, DE, HU, PL)
- **Google Reviews** integrácia
- **Newsletter** systém
- **AI Chatbot** (OpenAI GPT-4)
- **WhatsApp** integrácia

---

## 🚀 Quick Start

### 1. **Clone Repository**
```bash
git clone https://github.com/mikailpirgozi/Apartmany-vita.git
cd Apartmany-vita
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Setup Environment**
```bash
cp .env.example .env.local
```

Nastavte potrebné environment variables:
```env
# POVINNÉ
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
DATABASE_URL="postgresql://username:password@localhost:5432/apartmany_vita"
```

### 4. **Setup Database**
```bash
npx prisma generate
npx prisma db push
```

### 5. **Run Development Server**
```bash
npm run dev
```

Otvorte [http://localhost:3000](http://localhost:3000) v prehliadači.

---

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15.5.4** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library
- **Framer Motion** - Animations

### **Backend**
- **NextAuth.js** - Authentication
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Zod** - Validation

### **Services**
- **Google OAuth** - Social login
- **OpenAI** - AI chatbot
- **Resend** - Email service
- **Stripe** - Payment processing

---

## 📱 Screenshots

### 🏠 **Homepage**
- Hero section s search widget
- Apartment preview grid
- Features section

### 🔐 **Authentication**
- Google OAuth + Email/Password
- User dashboard s loyalty tier
- Profile management

### 🏢 **Apartment Details**
- Image gallery s lightbox
- Amenities s ikonami
- Booking widget s pricing

---

## 🏆 Loyalty Program

Automatické zľavy pre registrovaných používateľov:

| Tier | Rezervácie | Zľava |
|------|------------|-------|
| 🥉 **Bronze** | 0+ | 5% |
| 🥈 **Silver** | 3+ | 7% |
| 🥇 **Gold** | 6+ | 10% |

---

## 🌐 Deployment

### **Railway (Odporúčané)**
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app)

1. Pripojte GitHub repository
2. Railway automaticky detekuje Next.js
3. Nastavte environment variables
4. Deploy!

### **Vercel**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 📊 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages
│   ├── (main)/            # Main site
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Shadcn/UI
│   ├── apartment/        # Apartment components
│   ├── booking/          # Booking components
│   └── layout/           # Layout components
├── lib/                  # Utilities
│   ├── auth.ts           # NextAuth config
│   ├── db.ts             # Prisma client
│   └── utils.ts          # Helper functions
├── services/             # API services
└── types/                # TypeScript types
```

---

## 🔧 Available Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run test         # Unit tests
npm run test:e2e     # E2E tests
```

---

## 📝 Environment Variables

```env
# NextAuth.js
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Database
DATABASE_URL="postgresql://..."

# Optional Services
BEDS24_API_KEY="..."
STRIPE_SECRET_KEY="..."
RESEND_API_KEY="..."
OPENAI_API_KEY="..."
```

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Contact

**Apartmány Vita**
- 📧 Email: info@apartmanyvita.sk
- 🌐 Website: [apartmanyvita.sk](https://apartmanyvita.sk)
- 📍 Address: Štúrovo námestie 132/16, 911 01 Trenčín

**Developer**
- 👨‍💻 GitHub: [@mikailpirgozi](https://github.com/mikailpirgozi)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Shadcn/UI](https://ui.shadcn.com/) - Component library
- [Railway](https://railway.app/) - Deployment platform
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

---

**✨ Apartmány Vita - Luxusné ubytovanie v centre Trenčína**