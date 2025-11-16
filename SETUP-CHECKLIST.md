# Setup Checklist

Use this checklist to track your setup progress:

## Local Development Setup

- [ ] Downloaded Firebase Service Account Key
  - Go to: https://console.firebase.google.com/project/sellaya-lba-02-52991340-1d0a3/settings/serviceaccounts/adminsdk
  - Click "Generate New Private Key"
  - Save the JSON file securely

- [ ] Updated `.env.local` file
  - [ ] Added Firebase Service Account Key (entire JSON on one line)
  - [ ] Added Stripe Secret Key (from https://dashboard.stripe.com/test/apikeys)
  - [ ] Added Stripe Publishable Key
  - [ ] Verified Resend API Key is present

- [ ] Installed dependencies
  ```bash
  npm install
  ```

- [ ] Started development server
  ```bash
  npm run dev
  ```

- [ ] Verified app is running at http://localhost:3000

- [ ] Tested basic functionality:
  - [ ] Homepage loads correctly
  - [ ] Can navigate through booking flow
  - [ ] Firebase connection working (check console for errors)

## Production Deployment Preparation

- [ ] Created production Stripe account
  - [ ] Obtained live API keys (sk_live_... and pk_live_...)

- [ ] Verified Resend email domain
  - Go to: https://resend.com/domains
  - Add and verify your domain

- [ ] Created `.env.production` file
  - [ ] Set NEXT_PUBLIC_APP_URL to your domain
  - [ ] Set NODE_ENV=production
  - [ ] Updated Stripe keys to LIVE keys
  - [ ] All other environment variables copied from .env.local

- [ ] Tested production build locally
  ```bash
  npm run build
  npm start
  ```

- [ ] Verified Firebase Security Rules are set
  - Check firestore.rules
  - Check storage.rules

## Deployment to Hosting

- [ ] Choose hosting provider:
  - [ ] Hostinger
  - [ ] DigitalOcean
  - [ ] AWS
  - [ ] Other: ___________

- [ ] Followed deployment steps in DEPLOYMENT.md

- [ ] Configured environment variables on hosting platform

- [ ] Deployed application

- [ ] Verified production deployment:
  - [ ] Site loads correctly
  - [ ] SSL/HTTPS is working
  - [ ] Booking flow works
  - [ ] Payment processing works
  - [ ] Emails are being sent

## Post-Deployment

- [ ] Set up monitoring/logging

- [ ] Configure backup strategy for Firestore data

- [ ] Document any custom configuration

- [ ] Test email notifications end-to-end

- [ ] Update DNS if needed

---

## Notes

Add any notes, issues, or reminders here:

- 
- 
- 

---

Last Updated: ___________
