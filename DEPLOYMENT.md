# 🚀 GitHub Pages Deployment Guide

This guide will help you deploy your Financial Tracker to GitHub Pages.

---

## ✅ Prerequisites

- Your code is pushed to GitHub
- You have a Supabase project set up
- Google OAuth is configured (if using authentication)

---

## 📝 Step-by-Step Deployment

### Step 1: Add GitHub Secrets

1. Go to your repository on GitHub: [https://github.com/JohnnyvonH/financial-tracker](https://github.com/JohnnyvonH/financial-tracker)
2. Click **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add the following secrets:

   **Secret 1:**
   - **Name:** `VITE_SUPABASE_URL`
   - **Value:** Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
   - Click **Add secret**

   **Secret 2:**
   - **Name:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** Your Supabase anon/public key
   - Click **Add secret**

### Step 2: Enable GitHub Pages

1. Still in **Settings**, scroll down to **Pages** in the left sidebar
2. Under **Source**, select **GitHub Actions**
3. Click **Save**

### Step 3: Update Supabase Redirect URLs ⚠️ CRITICAL

Your app will be hosted at: `https://johnnyvonh.github.io/financial-tracker/`

**This is the most important step for OAuth to work!**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Update the following fields:

   **Site URL:**
   ```
   https://johnnyvonh.github.io/financial-tracker/
   ```

   **Redirect URLs** (add ALL of these):
   ```
   https://johnnyvonh.github.io/financial-tracker/
   https://johnnyvonh.github.io/financial-tracker/**
   http://localhost:5173/**
   ```

5. Click **Save**
6. **WAIT 2-3 MINUTES** for Supabase to apply the changes

### Step 4: Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized JavaScript origins**, make sure you have:
   ```
   https://johnnyvonh.github.io
   http://localhost:5173
   https://YOUR-PROJECT-ID.supabase.co
   ```

6. Under **Authorized redirect URIs**, add **EXACTLY** (replace YOUR-PROJECT-ID):
   ```
   https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
   http://localhost:5173/
   ```

7. Click **Save**
8. **WAIT 5-10 MINUTES** for Google to propagate changes

### Step 5: Trigger Deployment

The deployment will happen automatically when you push to the `main` branch. To manually trigger:

1. Go to **Actions** tab in your repository
2. Click **Deploy to GitHub Pages** workflow
3. Click **Run workflow** → **Run workflow**

Or simply push any change:
```bash
git add .
git commit -m "Trigger deployment"
git push origin main
```

### Step 6: Wait for Deployment

1. Go to the **Actions** tab
2. You'll see your deployment running
3. Wait 2-3 minutes for it to complete
4. Once done, you'll see a green checkmark ✅

### Step 7: Access Your App

Your app is now live at:
**https://johnnyvonh.github.io/financial-tracker/**

---

## 🔄 Updating Your Deployed App

Every time you push to `main` branch, GitHub Actions will automatically:
1. Build your app
2. Deploy the new version to GitHub Pages
3. Your live site updates in ~2-3 minutes

---

## 🐛 Troubleshooting

### OAuth Error: "404 There isn't a GitHub Pages site here"

**This is a redirect URL issue!** Fix it:

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Make sure **Redirect URLs** includes:
   ```
   https://johnnyvonh.github.io/financial-tracker/**
   ```
3. The `/**` wildcard at the end is CRITICAL
4. Click **Save**
5. **Wait 2-3 minutes** for changes to apply
6. Clear browser cache (Ctrl+Shift+Del)
7. Try signing in again

### OAuth Error: "Error 401: invalid_client"

**Google OAuth credentials issue:**

1. Verify your Google OAuth Client ID and Secret in Supabase match Google Cloud Console
2. Check that Google OAuth redirect URIs include your Supabase callback URL:
   ```
   https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
   ```
3. Make sure you've waited 5-10 minutes after saving Google OAuth settings
4. Try using an incognito window to rule out cached credentials

### Build Fails

**Check the Actions tab:**
1. Go to **Actions** tab
2. Click on the failed workflow
3. Click on the failed job
4. Review the error messages

**Common issues:**
- Missing secrets → Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Build errors → Run `npm run build` locally to test
- Dependencies issue → Run `npm ci` locally to verify

### App Loads But Shows Errors

**Supabase connection issues:**
- Check that secrets are correctly set in GitHub
- Verify Supabase redirect URLs include your GitHub Pages URL with `/**` wildcard
- Check browser console (F12) for specific errors

**OAuth not working:**
- Verify redirect URLs in Supabase include the `/**` wildcard
- Make sure Google OAuth redirect URIs include your Supabase callback
- Clear browser cache and try again in incognito mode
- Check that you've waited for changes to propagate (2-10 minutes)

### Blank Page

**Base path issue:**
- Check `vite.config.js` has `base: '/financial-tracker/'`
- Verify the base path matches your repository name
- Clear cache and hard reload (Ctrl+Shift+R)

### 404 Error

1. Check that GitHub Pages is enabled in repository settings
2. Verify the workflow completed successfully
3. Wait a few minutes for DNS propagation
4. Try accessing: `https://johnnyvonh.github.io/financial-tracker/index.html`

---

## 🔍 Testing OAuth Locally

Before deploying, test OAuth locally:

1. Make sure your `.env.local` has:
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. In Supabase redirect URLs, include:
   ```
   http://localhost:5173/**
   ```

3. In Google OAuth, include:
   ```
   http://localhost:5173
   ```

4. Run `npm run dev` and test sign in

---

## 🔒 Security Notes

### Environment Variables

- **Never commit** `.env.local` to Git
- Secrets are encrypted in GitHub Actions
- `VITE_SUPABASE_ANON_KEY` is safe to expose in the built app (it's public)
- Row-level security in Supabase protects your data

### Supabase Security

- All data is protected by Row Level Security (RLS)
- Users can only access their own data
- Anon key can't access other users' information
- Always keep your `service_role` key private (don't use it in frontend)

---

## 📊 Monitoring

### Check Deployment Status

1. **Actions tab:** See all deployments and their status
2. **Environments:** Click **github-pages** to see deployment history
3. **Build time:** Usually takes 1-2 minutes

### View Logs

1. Go to **Actions** tab
2. Click on any workflow run
3. Click on the job to expand logs
4. Review build output and any errors

---

## 🎯 Custom Domain (Optional)

To use a custom domain like `finance.yourdomain.com`:

1. Add a `CNAME` file in your repository root:
   ```
   finance.yourdomain.com
   ```
2. Add DNS records at your domain provider:
   ```
   Type: CNAME
   Name: finance
   Value: johnnyvonh.github.io
   ```
3. In GitHub Settings → Pages:
   - Enter your custom domain
   - Enable **Enforce HTTPS**
4. Update Supabase and OAuth redirect URLs to your custom domain

---

## 🚀 Quick Reference

**Your Live URL:**
```
https://johnnyvonh.github.io/financial-tracker/
```

**Deploy Command:**
```bash
git push origin main
```

**View Deployments:**
```
https://github.com/JohnnyvonH/financial-tracker/actions
```

**Test Build Locally:**
```bash
npm run build
npm run preview
```

**Critical Supabase Setting:**
Redirect URLs must include: `https://johnnyvonh.github.io/financial-tracker/**`

---

## ✨ Done!

Your Financial Tracker is now live and accessible from anywhere! 🎉

Every push to `main` automatically deploys updates to your live site.
