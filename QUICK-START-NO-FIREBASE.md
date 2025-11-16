# ⚡ Super Quick Start (No Firebase!)

## 3 Commands to Get Running:

```powershell
# 1. Install
npm install

# 2. Setup database (creates a local SQLite file)
npx prisma db push

# 3. Run
npm run dev
```

**Open:** http://localhost:3000

**That's it!** 🎉

---

## What Just Happened?

- ✅ Removed all Firebase dependencies
- ✅ Using local SQLite database (file: `dev.db`)
- ✅ Files upload to `public/uploads/`
- ✅ No cloud services required

---

## Environment Setup (Optional)

The `.env.local` file is already configured with:
- ✅ SQLite database (`DATABASE_URL`)
- ✅ Resend API key (from your old code)
- ⚠️ You still need Stripe keys for payments

### Add Stripe Keys (if you need payments):

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy your keys
3. Update `.env.local`:
   ```env
   STRIPE_SECRET_KEY=sk_test_YOUR_KEY
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
   ```

---

## View Your Database:

```powershell
npm run db:studio
```

Opens http://localhost:5555 with a visual database editor.

---

## Need Help?

- **Complete guide:** `FIREBASE-TO-LOCAL-MIGRATION.md`
- **Component updates:** Run `.\find-firebase-imports.ps1`
- **Deployment:** `DEPLOYMENT.md`

---

## Switch to PostgreSQL Later (Optional):

When you're ready for production:

1. Install PostgreSQL or use hosted (Neon.tech, Supabase)
2. Update `.env.local`:
   ```env
   DATABASE_URL="postgresql://user:pass@localhost:5432/sellaya_lba"
   ```
3. Run: `npx prisma db push`

---

**You're Firebase-free and ready to code!** 🚀
