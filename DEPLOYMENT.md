# Local Development & Deployment Guide

This guide will help you run the Sellaya LBA-02 (Looks by Anum) booking system locally and deploy it to Hostinger or any Node.js hosting provider.

## Prerequisites

- Node.js 18+ installed
- Firebase project (already set up)
- Stripe account (for payments)
- Resend account (for emails)
- Hosting provider with Node.js support (e.g., Hostinger, DigitalOcean, AWS, etc.)

---

## Part 1: Local Development Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `sellaya-lba-02-52991340-1d0a3`
3. Click the gear icon ⚙️ > **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the downloaded JSON file (keep it secure!)

### Step 3: Configure Environment Variables

The `.env.local` file has been created for you. Update it with your actual credentials:

1. **Firebase Service Account**: Copy the entire contents of the JSON file you downloaded in Step 2 and paste it as the value for `FIREBASE_SERVICE_ACCOUNT_KEY` (keep it on one line)

2. **Stripe Keys**: 
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
   - Copy your **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Copy your **Secret key** → `STRIPE_SECRET_KEY`

3. **Resend API Key**:
   - Go to [Resend Dashboard](https://resend.com/api-keys)
   - Create a new API key
   - Copy it → `RESEND_API_KEY`

Your `.env.local` should look like this (with real values):

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBE-eF2AWbN34wfSeoMc3JATUX0zWLQKhQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sellaya-lba-02-52991340-1d0a3.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sellaya-lba-02-52991340-1d0a3
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sellaya-lba-02-52991340-1d0a3.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=179293509698
NEXT_PUBLIC_FIREBASE_APP_ID=1:179293509698:web:64c17a06d6f2496c8835db
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-1W10431S1V

# Firebase Admin SDK (paste the ENTIRE JSON on one line)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"sellaya-lba-02-52991340-1d0a3","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",...}

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51ABC123...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123...

# Resend Email API
RESEND_API_KEY=re_ABC123...

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

### Step 4: Run Development Server

```bash
npm run dev
```

Your app should now be running at [http://localhost:3000](http://localhost:3000)

---

## Part 2: Production Build (Testing Locally)

Before deploying, test the production build locally:

```bash
# Build the application
npm run build

# Start production server
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to test the production build.

---

## Part 3: Deploy to Hostinger

### Option A: Using Hostinger's Node.js Hosting

1. **Build Your Application Locally**:
   ```bash
   npm run build
   ```

2. **Prepare Files for Upload**:
   - `.next` folder (generated after build)
   - `public` folder
   - `node_modules` folder (or install on server)
   - `package.json`
   - `.env.production` (see below)

3. **Create `.env.production` File**:
   Copy `.env.local` and rename it to `.env.production`. Update these values:
   ```env
   # Change the app URL to your production domain
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   NODE_ENV=production
   
   # Use production Stripe keys instead of test keys
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   
   # Keep all other values the same
   ```

4. **Upload to Hostinger**:
   - Use File Manager or FTP/SFTP to upload files
   - Upload to your Node.js application directory

5. **Install Dependencies on Server**:
   ```bash
   npm install --production
   ```

6. **Configure Hostinger Node.js Settings**:
   - Application Root: `/home/youruser/yourapp`
   - Application URL: `https://yourdomain.com`
   - Application Startup File: `node_modules/next/dist/bin/next`
   - Application Startup Script Arguments: `start`
   - Environment: `production`

7. **Set Environment Variables in Hostinger**:
   - Go to your Hostinger control panel
   - Find Node.js application settings
   - Add all environment variables from `.env.production`

### Option B: Using Docker (Recommended for Most Hosting)

1. **Create `Dockerfile`** (I can create this for you if needed)

2. **Build Docker Image**:
   ```bash
   docker build -t sellaya-lba .
   ```

3. **Run Container**:
   ```bash
   docker run -p 3000:3000 --env-file .env.production sellaya-lba
   ```

### Option C: Using VPS (DigitalOcean, Linode, etc.)

1. **SSH into your server**

2. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone/Upload your code**

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Build the application**:
   ```bash
   npm run build
   ```

6. **Install PM2 (Process Manager)**:
   ```bash
   sudo npm install -g pm2
   ```

7. **Start the application**:
   ```bash
   pm2 start npm --name "sellaya-lba" -- start
   pm2 save
   pm2 startup
   ```

8. **Setup Nginx as reverse proxy** (optional but recommended):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## Part 4: Important Security Notes

1. **Never commit `.env.local` or `.env.production`** to Git
2. **Use production Stripe keys** in production (not test keys)
3. **Enable HTTPS** on your production domain
4. **Set up Firestore security rules** properly
5. **Verify your domain with Resend** for email sending

---

## Part 5: Troubleshooting

### Problem: Firebase Admin not connecting
- **Solution**: Make sure `FIREBASE_SERVICE_ACCOUNT_KEY` is properly formatted JSON on a single line
- Check that the service account has proper permissions in Firebase Console

### Problem: Stripe checkout not working
- **Solution**: Verify Stripe keys are correct and match your environment (test vs live)
- Check that success/cancel URLs are properly configured

### Problem: Emails not sending
- **Solution**: Verify Resend API key is valid
- Check that sender email domain is verified in Resend
- Look at server logs for detailed error messages

### Problem: Build fails
- **Solution**: Run `npm install` again
- Clear `.next` folder: `rm -rf .next`
- Check Node.js version (should be 18+)

---

## Part 6: Monitoring & Maintenance

### View Application Logs
```bash
# If using PM2
pm2 logs sellaya-lba

# If using Docker
docker logs <container-id>
```

### Restart Application
```bash
# PM2
pm2 restart sellaya-lba

# Docker
docker restart <container-id>
```

### Update Application
1. Pull latest code changes
2. Run `npm install` (if dependencies changed)
3. Run `npm run build`
4. Restart the application

---

## Need Help?

- **Firebase**: https://firebase.google.com/docs
- **Next.js**: https://nextjs.org/docs
- **Stripe**: https://stripe.com/docs
- **Resend**: https://resend.com/docs

---

## Summary of Changes Made for Local Development

1. ✅ Created `.env.local` and `.env.local.example` for environment variables
2. ✅ Updated `src/firebase/server-init.ts` to support local service account authentication
3. ✅ Updated `src/lib/email.ts` to use environment variables for Resend API key
4. ✅ Updated `.gitignore` to protect sensitive files
5. ✅ Firebase client config already uses public environment variables (safe to commit)

Your application is now ready for local development and deployment to any Node.js hosting provider!
