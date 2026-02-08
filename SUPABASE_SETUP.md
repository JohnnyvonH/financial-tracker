# 🚀 Supabase Cloud Sync Setup Guide

This guide will walk you through setting up cloud sync for your Financial Tracker app using Supabase.

---

## 📋 What You'll Get

✅ **Multi-device sync** - Access your finances from any device
✅ **Secure authentication** - Email/password + Google/GitHub OAuth
✅ **Real-time updates** - Changes sync instantly across devices
✅ **Goal milestones** - Automatic celebrations at 25%, 50%, 75%, 100%
✅ **Spending alerts** - Smart notifications for unusual spending
✅ **Data backup** - Your data is safely stored in the cloud
✅ **Row-level security** - Your data is private and secure

---

## 🛠️ Setup Steps

### Step 1: Create Supabase Account

1. Go to **[supabase.com](https://supabase.com)**
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email

### Step 2: Create New Project

1. Click **"New Project"** in your dashboard
2. Fill in project details:
   - **Name:** `financial-tracker` (or any name you like)
   - **Database Password:** Create a strong password and **save it securely**
   - **Region:** Choose **Europe West (London)** or closest to you
   - **Pricing Plan:** Free (perfect for personal use)
3. Click **"Create new project"**
4. Wait ~2 minutes for your database to provision ☕

### Step 3: Run Database Schema

1. In your Supabase Dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"** button
3. Open the file `supabase/schema.sql` from this repo
4. **Copy all contents** (it's a long file!)
5. **Paste into SQL Editor**
6. Click **"Run"** button (or press `Cmd/Ctrl + Enter`)
7. You should see: ✅ **"Success. No rows returned"**

This creates all your tables, security policies, and database functions.

### Step 4: Configure Authentication

#### Enable Email Authentication (Already Done)
1. Go to **Authentication → Providers**
2. **Email** should already be enabled ✅

#### Enable Google OAuth (Recommended)
1. In Supabase, go to **Authentication → Providers**
2. Click **Google**
3. You'll see:
   - **Redirect URL** - Copy this (you'll need it)
   - Example: `https://xxxxx.supabase.co/auth/v1/callback`

4. Go to [Google Cloud Console](https://console.cloud.google.com)
5. Create a new project or select existing
6. Enable **Google+ API**
7. Go to **Credentials → Create Credentials → OAuth 2.0 Client ID**
8. Configure OAuth consent screen (if needed)
9. Application type: **Web application**
10. Add **Authorized redirect URI**: Paste the Supabase redirect URL
11. Click **Create**
12. Copy **Client ID** and **Client Secret**

13. Back in Supabase, paste:
    - **Client ID**
    - **Client Secret**
14. Click **Save**

#### Enable GitHub OAuth (Optional)
Same process as Google, but use GitHub OAuth Apps:
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name:** Financial Tracker
   - **Homepage URL:** `http://localhost:5173` (for dev)
   - **Authorization callback URL:** Your Supabase redirect URL
4. Copy **Client ID** and **Client Secret** to Supabase

### Step 5: Get Your API Keys

1. In Supabase, go to **Project Settings** (gear icon)
2. Click **API** in the left sidebar
3. You'll see:
   - **Project URL** - Example: `https://xxxxx.supabase.co`
   - **anon public** key - This is safe for frontend
   - **service_role** key - ⚠️ Keep this secret! (you won't need it for now)

4. Copy both **Project URL** and **anon public** key

### Step 6: Configure Your App

1. In your project root, create a file called `.env.local`
2. Add your Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **Important:** Make sure `.env.local` is in your `.gitignore` (it should be by default)

### Step 7: Install Dependencies

```bash
npm install @supabase/supabase-js
```

### Step 8: Update Your App

Open `src/main.jsx` and wrap your app with the AuthProvider:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
```

### Step 9: Add Auth Button to Header

In your main component or header, add the AuthButton:

```jsx
import AuthButton from './components/AuthButton';

// Inside your header/navbar:
<AuthButton />
```

### Step 10: Test It Out!

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Click "Sign In"** button
3. **Create an account** with email or OAuth
4. Check your email for verification (if using email signup)
5. **Sign in** and you're live! 🎉

---

## 📱 Testing Multi-Device Sync

1. **Sign in on your computer**
2. Add a transaction
3. **Open your app on your phone** (or another browser)
4. Sign in with the same account
5. **Your transaction appears instantly!** ⚡

---

## 🔄 Migrating Existing Data

If you already have data in localStorage, the app will automatically offer to migrate it when you first sign in.

Or you can manually trigger migration:

```javascript
import { migrateLocalDataToSupabase } from './utils/migration';
import { useAuth } from './contexts/AuthContext';

const { user } = useAuth();

if (user) {
  const result = await migrateLocalDataToSupabase(user.id);
  console.log('Migration result:', result);
}
```

---

## 🔒 Security Features

### Row Level Security (RLS)
Every table has policies ensuring:
- ✅ You can only see your own data
- ✅ No one else can access your financial info
- ✅ All queries are automatically filtered by user

### Authentication
- ✅ JWT tokens (industry standard)
- ✅ Secure password hashing
- ✅ Session management
- ✅ OAuth providers (Google, GitHub)

---

## 🎯 What Works Now

### ✅ Implemented
- User authentication (email + OAuth)
- Cloud data sync for:
  - Transactions
  - Budgets
  - Goals (with milestone tracking)
  - Bills
  - User settings
- Real-time updates across devices
- Automatic goal milestone celebrations
- Data migration from localStorage
- Secure row-level security

### 🚧 Coming Soon (Phase 2)
- Category deep-dive (click category → see all transactions)
- AI-powered spending forecasts
- Unusual spending alerts
- PDF export for reports

---

## 🧪 Database Tables

Your Supabase project now has these tables:

1. **profiles** - User profile information
2. **user_settings** - App preferences (currency, notifications)
3. **transactions** - All income/expense transactions
4. **budgets** - Budget limits per category
5. **goals** - Savings goals with progress tracking
6. **bills** - Bill reminders and due dates
7. **recurring_transactions** - Templates for recurring payments
8. **spending_alerts** - Smart notifications
9. **goal_milestones** - Achievement tracking (25%, 50%, 75%, 100%)

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists in your project root
- Check that variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your dev server after creating `.env.local`

### "Row level security policy violation"
- Make sure you're signed in
- Check that the SQL schema was executed correctly
- Verify RLS policies exist: Go to **Database → Tables → [table name] → Policies**

### "Invalid login credentials"
- Double-check email and password
- If using email signup, verify your email first
- Try password reset if needed

### Data not syncing
- Check browser console for errors
- Verify you're signed in (check for user icon in header)
- Make sure internet connection is stable
- Check Supabase project status

### OAuth redirect not working
- Verify redirect URLs match exactly in OAuth provider settings
- Check that provider is enabled in Supabase
- Try clearing browser cache

---

## 📊 Monitoring Your Database

### View Data
1. Go to **Table Editor** in Supabase
2. Select any table to see your data
3. You can manually edit/delete if needed

### Check Logs
1. Go to **Logs** in Supabase
2. Filter by:
   - API requests
   - Postgres logs
   - Auth events

### Database Usage
1. Go to **Settings → Usage**
2. Monitor:
   - Database size
   - API requests
   - Bandwidth
   - Active users

---

## 💰 Pricing

### Free Tier Includes:
- ✅ 500 MB database space
- ✅ 1 GB file storage
- ✅ 2 GB bandwidth/month
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests

**Perfect for personal use!** You'd need thousands of transactions to hit limits.

### Upgrade When:
- You need more storage
- You want custom domain
- You need priority support

---

## 🎓 Next Steps

1. ✅ **Test authentication** - Sign up, sign in, sign out
2. ✅ **Add some data** - Create transactions, budgets, goals
3. ✅ **Test multi-device** - Sign in from another device
4. ✅ **Check goal milestones** - Update a goal to 25%, 50%, 75%, 100%
5. 🚧 **Phase 2 features** - We'll add these next!

---

## 🆘 Need Help?

- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Discord:** [Supabase Discord](https://discord.supabase.com)
- **GitHub Issues:** Create an issue in this repo

---

## 🎉 You're All Set!

Your Financial Tracker now has:
- ✅ Cloud backup
- ✅ Multi-device sync
- ✅ Secure authentication
- ✅ Real-time updates
- ✅ Goal milestone tracking

**Welcome to the cloud! 🌥️💰**
