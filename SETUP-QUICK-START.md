# 🚀 Quick Start Guide

## You're 3 Steps Away from Running Locally!

### Step 1: Get Your Firebase Service Account Key

1. Visit: https://console.firebase.google.com/project/sellaya-lba-02-52991340-1d0a3/settings/serviceaccounts/adminsdk
2. Click **"Generate New Private Key"**
3. Save the JSON file that downloads

### Step 2: Update `.env.local`

Open `.env.local` in this project and update these 3 things:

1. **FIREBASE_SERVICE_ACCOUNT_KEY**: 
   - Open the JSON file you just downloaded
   - Copy THE ENTIRE CONTENTS
   - Paste it as one line (replace the placeholder)
   - Example: `FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\nABC123...\n-----END PRIVATE KEY-----\n",...}`

2. **STRIPE_SECRET_KEY & NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**:
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Copy both keys and paste them

3. **RESEND_API_KEY**: 
   - Already filled in (re_X5Wi633i_BLckUhMy5CEeeR5crnfga97H)
   - Or get a new one at: https://resend.com/api-keys

### Step 3: Install & Run

```bash
npm install
npm run dev
```

Visit: http://localhost:3000

---

## ✅ What's Already Done

- ✅ Environment variables set up (`.env.local`)
- ✅ Firebase Admin SDK configured for local dev
- ✅ Stripe integration ready
- ✅ Email service (Resend) configured
- ✅ Security files (.gitignore) updated
- ✅ Build scripts optimized

---

## 📚 Full Documentation

See `DEPLOYMENT.md` for:
- Complete deployment guide to Hostinger
- VPS deployment options
- Docker setup
- Production configuration
- Troubleshooting tips

---

## 🆘 Stuck?

**Common Issues:**

1. **"Firebase Admin initialization error"**
   - Make sure the service account JSON is on ONE line
   - Check there are no syntax errors in the JSON

2. **"Module not found"**
   - Run `npm install` again
   - Delete `node_modules` and `.next` folders, then reinstall

3. **Stripe not working**
   - Make sure you're using TEST keys (start with `sk_test_` and `pk_test_`)
   - Check the keys are copied correctly with no extra spaces

---

## 🎯 What This App Does

This is a booking and quote system for **Looks by Anum** (makeup artist services):

- ✨ **Quote Generation**: AI-powered pricing based on services
- 📅 **Booking Management**: Track appointments and confirmations
- 💳 **Stripe Payments**: 50% deposit collection
- 📧 **Email Notifications**: Automated emails via Resend
- 🔥 **Firebase Backend**: Firestore database + Authentication
- 🎨 **Modern UI**: Next.js 15 + Tailwind CSS

---

## 🚢 Ready to Deploy?

See `DEPLOYMENT.md` for full deployment instructions to:
- Hostinger
- DigitalOcean / AWS / Linode
- Any Node.js hosting provider

---

**You've got this! 🎉**
