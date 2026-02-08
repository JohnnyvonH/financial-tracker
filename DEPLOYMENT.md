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

### Step 3: Update Supabase Redirect URLs

Your app will be hosted at: `https://johnnyvonh.github.io/financial-tracker/`

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Add to **Redirect URLs**:
   ```
   https://johnnyvonh.github.io/financial-tracker/
   ```
5. Add to **Site URL**:
   ```
   https://johnnyvonh.github.io/financial-tracker/
   ```
6. Click **Save**

### Step 4: Update Google OAuth (If Using)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Go to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized JavaScript origins**, add:
   ```
   https://johnnyvonh.github.io
   ```
5. Under **Authorized redirect URIs**, add:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
6. Click **Save**

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
- Verify Supabase redirect URLs include your GitHub Pages URL
- Check browser console (F12) for specific errors

**OAuth not working:**
- Verify Google OAuth redirect URIs include your GitHub Pages domain
- Make sure Supabase redirect URLs are correct
- Clear browser cache and try again

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

**Check Build Locally:**
```bash
npm run build
npm run preview
```

---

## ✨ Done!

Your Financial Tracker is now live and accessible from anywhere! 🎉

Every push to `main` automatically deploys updates to your live site.
