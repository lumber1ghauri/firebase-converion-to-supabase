# Sellaya LBA-02 - Looks by Anum Booking System

A modern, AI-powered booking and quote system for makeup artist services, built with Next.js 15, Firebase, and Stripe.

## 🚀 Quick Start (Local Development)

**Want to get running in 5 minutes?** See [SETUP-QUICK-START.md](./SETUP-QUICK-START.md)

### Prerequisites
- Node.js 18 or higher
- Firebase project (already configured)
- Stripe account
- Resend account (for emails)

### Installation

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   - Update `.env.local` with your credentials
   - See [SETUP-QUICK-START.md](./SETUP-QUICK-START.md) for where to get each credential

3. **Verify Setup**
   ```powershell
   .\verify-setup.ps1
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   - Visit [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- **[SETUP-QUICK-START.md](./SETUP-QUICK-START.md)** - Get running locally in 3 steps
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy to Hostinger, VPS, or Docker
- **[SETUP-CHECKLIST.md](./SETUP-CHECKLIST.md)** - Track your setup progress
- **[MIGRATION-SUMMARY.md](./MIGRATION-SUMMARY.md)** - What changed from Firebase hosting

## ✨ Features

- 🤖 **AI-Powered Quotes** - Intelligent pricing using Google Genkit
- 📅 **Booking Management** - Complete booking flow with confirmation
- 💳 **Stripe Integration** - Secure 50% deposit collection
- 📧 **Email Notifications** - Automated emails via Resend
- 🔥 **Firebase Backend** - Firestore database + Authentication
- 🎨 **Modern UI** - Tailwind CSS + Radix UI components
- 📱 **Responsive Design** - Works on all devices

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
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
├── firebase/             # Firebase configuration
│   ├── config.ts         # Client config
│   └── server-init.ts    # Server config
├── lib/                  # Utilities
│   ├── email.ts         # Email service
│   └── types.ts         # TypeScript types
└── ai/                   # AI/Genkit flows
```

## 🚢 Deployment

This application can be deployed to:

- ✅ Hostinger (Node.js hosting)
- ✅ VPS (DigitalOcean, AWS, Linode)
- ✅ Docker containers
- ✅ Any Node.js hosting provider

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

## 🔐 Environment Variables

Required environment variables (all documented in `.env.local.example`):

- Firebase credentials (client & server)
- Stripe API keys
- Resend API key
- Application URL

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler check

## 🐳 Docker Support

Build and run with Docker:

```bash
# Build image
docker build -t sellaya-lba .

# Run container
docker run -p 3000:3000 --env-file .env.production sellaya-lba
```

## 🆘 Troubleshooting

Having issues? Check the troubleshooting section in [DEPLOYMENT.md](./DEPLOYMENT.md)

Common issues:
- Firebase Admin not connecting → Check service account key
- Stripe not working → Verify API keys
- Emails not sending → Check Resend configuration

## 📝 License

Private project - All rights reserved

## 🙋 Support

For questions or issues:
1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
2. Review [SETUP-QUICK-START.md](./SETUP-QUICK-START.md)
3. Contact the development team

---

**Built with ❤️ for Looks by Anum**

