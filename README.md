# Sellaya LBA-02 - Looks by Anum Booking System

A modern, AI-powered booking and quote system for makeup artist services, built with Next.js 15, Prisma, and Stripe.

## 🚀 Quick Start (Local Development)

**New to this project?** See [FIREBASE-REMOVAL-COMPLETE.md](./FIREBASE-REMOVAL-COMPLETE.md)

### Prerequisites
- Node.js 18 or higher
- PostgreSQL (optional - can use SQLite)

### Installation

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Set Up Database**
   
   **Option A: SQLite (Easiest)**
   ```bash
   # Update .env.local
   DATABASE_URL="file:./dev.db"
   
   # Initialize database
   npx prisma db push
   ```
   
   **Option B: PostgreSQL**
   ```bash
   # Update .env.local
   DATABASE_URL="postgresql://username:password@localhost:5432/sellaya_lba"
   
   # Initialize database
   npx prisma db push
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   - Visit [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- **[FIREBASE-REMOVAL-COMPLETE.md](./FIREBASE-REMOVAL-COMPLETE.md)** - Migration summary & quick start
- **[FIREBASE-TO-LOCAL-MIGRATION.md](./FIREBASE-TO-LOCAL-MIGRATION.md)** - Complete migration guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy to Hostinger, VPS, or Docker
- **[SETUP-CHECKLIST.md](./SETUP-CHECKLIST.md)** - Track your setup progress

## ✨ Features

- 🤖 **AI-Powered Quotes** - Intelligent pricing using Google Genkit
- 📅 **Booking Management** - Complete booking flow with confirmation
- 💳 **Stripe Integration** - Secure 50% deposit collection
- 📧 **Email Notifications** - Automated emails via Resend
- 🗄️ **Prisma ORM** - Type-safe database access
- 💾 **PostgreSQL/SQLite** - Your choice of database
- 🎨 **Modern UI** - Tailwind CSS + Radix UI components
- 📱 **Responsive Design** - Works on all devices

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Prisma + PostgreSQL/SQLite
- **Payments**: Stripe
- **Email**: Resend
- **AI**: Google Genkit
- **Styling**: Tailwind CSS
- **Components**: Radix UI
- **Language**: TypeScript

## 📦 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── book/              # Booking flow
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes (Stripe)
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature components
├── lib/                  # Utilities
│   ├── database.ts       # Database operations
│   ├── prisma.ts         # Prisma client
│   ├── email.ts          # Email service
│   └── types.ts          # TypeScript types
├── ai/                   # AI/Genkit flows
prisma/
└── schema.prisma         # Database schema
```

## 🚢 Deployment

This application can be deployed to:

- ✅ Hostinger (Node.js hosting)
- ✅ VPS (DigitalOcean, AWS, Linode)
- ✅ Docker containers
- ✅ Any Node.js hosting provider
- ✅ Vercel, Netlify, Railway

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

## 🔐 Environment Variables

Required environment variables (see `.env.local.example`):

```env
DATABASE_URL="file:./dev.db"  # or PostgreSQL connection string
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create database migration
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler check

## 🗄️ Database Commands

```bash
# View database in browser
npm run db:studio

# Update database schema
npm run db:push

# Create migration (production)
npm run db:migrate

# Generate Prisma Client
npx prisma generate
```

## 🐳 Docker Support

Build and run with Docker:

```bash
# Build image
docker build -t sellaya-lba .

# Run container
docker run -p 3000:3000 --env-file .env.production sellaya-lba
```

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Make sure Prisma Client is generated
npx prisma generate

# Push schema to database
npx prisma db push
```

### Import Errors
```bash
# Find files that need updating
.\find-firebase-imports.ps1
```

See [FIREBASE-TO-LOCAL-MIGRATION.md](./FIREBASE-TO-LOCAL-MIGRATION.md) for more troubleshooting.

## 📝 License

Private project - All rights reserved

## 🙋 Support

For questions or issues:
1. Check [FIREBASE-TO-LOCAL-MIGRATION.md](./FIREBASE-TO-LOCAL-MIGRATION.md)
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
3. Contact the development team

---

**Built with ❤️ for Looks by Anum**

**No Firebase, No Cloud Dependencies, 100% Self-Hosted** 🎉


