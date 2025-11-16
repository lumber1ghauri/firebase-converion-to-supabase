# 🔄 Firebase to Local Database Migration Guide

## What Changed?

Your application has been converted from **Firebase** to a **fully local database setup** using:
- ✅ **Prisma ORM** - Modern database toolkit
- ✅ **PostgreSQL or SQLite** - Your choice of database
- ✅ **Local file storage** - No cloud storage needed
- ✅ **No Firebase dependencies** - Completely independent

---

## 📋 Quick Setup (3 Options)

### Option 1: SQLite (Easiest - Recommended for Getting Started)

**Perfect for:** Local development, testing, single-user systems

1. **Update `.env.local`:**
   ```env
   DATABASE_URL="file:./dev.db"
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Initialize database:**
   ```powershell
   npx prisma db push
   ```

4. **Run the app:**
   ```powershell
   npm run dev
   ```

**That's it!** Your app is running with SQLite (a file-based database).

---

### Option 2: PostgreSQL (Recommended for Production)

**Perfect for:** Production, multi-user systems, scalability

**Step 1: Install PostgreSQL**

**Windows:**
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer, remember the password you set
3. Default port: 5432

**Or use Docker:**
```powershell
docker run --name sellaya-postgres -e POSTGRES_PASSWORD=mysecretpassword -e POSTGRES_DB=sellaya_lba -p 5432:5432 -d postgres:16
```

**Step 2: Create Database**

```powershell
# Connect to PostgreSQL (if installed locally)
psql -U postgres

# Create database
CREATE DATABASE sellaya_lba;

# Exit
\q
```

**Step 3: Update `.env.local`:**
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/sellaya_lba?schema=public"
```

**Step 4: Initialize:**
```powershell
npm install
npx prisma db push
npm run dev
```

---

### Option 3: Hosted PostgreSQL (Best for Production Deployment)

**Free Options:**
- **Neon** - https://neon.tech (free tier, excellent)
- **Supabase** - https://supabase.com (free tier)
- **Railway** - https://railway.app (free trial)

**Steps:**
1. Create account on one of the platforms above
2. Create new PostgreSQL database
3. Copy the connection string they provide
4. Paste into `.env.local` as `DATABASE_URL`
5. Run `npx prisma db push`

---

## 🗂️ File Structure Changes

### New Files Created:

```
prisma/
  schema.prisma          ← Database schema
src/
  lib/
    prisma.ts           ← Prisma client
    database.ts         ← Database functions (replaces Firebase)
public/
  uploads/              ← Local file storage (auto-created)
```

### Files Modified:

- `package.json` - Removed Firebase, added Prisma
- `.env.local` - Changed to database connection string
- `.gitignore` - Added database and upload directories

### Files You Need to Update:

You'll need to update any files that import from `@/firebase/firestore/bookings` or `@/firebase/server-actions` to import from `@/lib/database` instead.

---

## 🔧 API Changes

### Old (Firebase):
```typescript
import { saveBookingClient } from '@/firebase/firestore/bookings';
import { getBooking } from '@/firebase/server-actions';

// Save booking (client)
await saveBookingClient(firestore, booking);

// Get booking (server)
const booking = await getBooking(bookingId);
```

### New (Prisma):
```typescript
import { saveBooking, getBooking } from '@/lib/database';

// Save booking (works everywhere)
await saveBooking(booking);

// Get booking (works everywhere)
const booking = await getBooking(bookingId);
```

**Key Differences:**
- ✅ No need to pass `firestore` instance
- ✅ Works in both client and server components
- ✅ Simpler API
- ✅ TypeScript type safety

---

## 🎯 Migration Checklist

- [ ] **Choose your database** (SQLite, PostgreSQL, or hosted)
- [ ] **Update `.env.local`** with DATABASE_URL
- [ ] **Install dependencies:** `npm install`
- [ ] **Push database schema:** `npx prisma db push`
- [ ] **Update imports** in your components (see below)
- [ ] **Test the application:** `npm run dev`
- [ ] **Remove old Firebase files** (optional, after testing)

---

## 📝 Files That Need Import Updates

Search for these imports and replace them:

### 1. Update booking imports:

**Find:**
```typescript
import { saveBookingClient, getBookingClient } from '@/firebase/firestore/bookings';
import { getBooking } from '@/firebase/server-actions';
```

**Replace with:**
```typescript
import { saveBooking, getBooking, getAllBookings, deleteBooking } from '@/lib/database';
```

### 2. Update file upload imports:

**Find:**
```typescript
import { uploadPaymentScreenshot } from '@/firebase/firestore/bookings';
```

**Replace with:**
```typescript
import { uploadPaymentScreenshot } from '@/lib/database';
```

### 3. Remove Firebase providers:

**Find:**
```typescript
import { FirebaseClientProvider } from '@/firebase/client-provider';
```

**Can be removed** - no longer needed!

---

## 🚀 New Database Commands

```powershell
# View your database in a GUI
npm run db:studio

# Push schema changes to database
npm run db:push

# Create a migration (for production)
npm run db:migrate

# Generate Prisma Client (auto-runs on install)
npx prisma generate
```

---

## 📊 Prisma Studio (Database GUI)

Want to see your data visually?

```powershell
npm run db:studio
```

Opens a web interface at http://localhost:5555 where you can:
- View all bookings
- Edit data manually
- Delete records
- Search and filter

---

## 🔐 File Upload Changes

### Old (Firebase Storage):
- Files stored in Google Cloud Storage
- Required Firebase configuration
- Public URLs from firebasestorage.googleapis.com

### New (Local Storage):
- Files stored in `public/uploads/` folder
- No configuration needed
- Public URLs like `/uploads/payment_screenshots/...`

### Important:
- Make sure to **backup the `public/uploads/` folder** in production
- Add to `.gitignore` if you don't want to commit uploads
- For production, consider using S3, Cloudflare R2, or similar

---

## 🆘 Troubleshooting

### "Can't reach database server"
- **SQLite**: Make sure DATABASE_URL is `file:./dev.db`
- **PostgreSQL**: Make sure PostgreSQL is running
- **Docker**: Run `docker ps` to check container is running

### "prisma command not found"
```powershell
npm install
npx prisma generate
```

### "Database does not exist"
```powershell
# For PostgreSQL, create it first:
CREATE DATABASE sellaya_lba;

# Then push schema:
npx prisma db push
```

### "File upload fails"
- Make sure `public/uploads/` directory exists (it's auto-created)
- Check file permissions
- Make sure you're not exceeding file size limits

### "Prisma Client not generated"
```powershell
npx prisma generate
```

---

## 🎉 Benefits of This Change

✅ **No Firebase costs** - Completely free database options
✅ **Faster** - Local database is much faster than cloud
✅ **Simpler** - No complex Firebase setup
✅ **Portable** - Easy to migrate between hosting providers
✅ **SQL Database** - Use standard SQL tools and queries
✅ **Type-safe** - Prisma provides full TypeScript support
✅ **Offline-capable** - Works without internet (with SQLite)

---

## 📦 What's Different

| Feature | Firebase | New Setup |
|---------|----------|-----------|
| Database | Cloud Firestore | PostgreSQL/SQLite |
| File Storage | Firebase Storage | Local filesystem |
| Setup Time | Complex (service accounts) | Simple (connection string) |
| Cost | Pay as you go | Free (self-hosted) |
| Speed | Network dependent | Local = Fast |
| Queries | Limited query options | Full SQL power |
| Tools | Firebase Console | Prisma Studio + SQL tools |

---

## 🚢 Deployment Options

With this setup, you can deploy to:

1. **Hostinger** - Upload files, set DATABASE_URL
2. **Vercel** - Connect database, deploy
3. **Netlify** - Same as Vercel
4. **DigitalOcean** - VPS with PostgreSQL
5. **AWS/Azure/GCP** - Any cloud provider
6. **Docker** - Containerize everything

See `DEPLOYMENT.md` for detailed instructions.

---

## 🎯 Next Steps

1. **Choose your database** (start with SQLite if unsure)
2. **Follow setup steps above**
3. **Test locally:** `npm run dev`
4. **Update component imports** (search for Firebase imports)
5. **Deploy when ready**

---

## 💡 Pro Tips

1. **Start with SQLite** for local development
2. **Use PostgreSQL** for production
3. **Run `npm run db:studio`** to visualize your data
4. **Backup your database** regularly
5. **Use migrations** for production (not db:push)

---

## 📚 Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Neon (Free Postgres)**: https://neon.tech
- **Prisma Studio**: https://www.prisma.io/studio

---

**You're now Firebase-free! 🎉 Your app is fully self-hosted and portable.**
