# Supabase Setup Guide

## 🚀 Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name:** financial-tracker
   - **Database Password:** (save this securely!)
   - **Region:** eu-west-2 (London)
4. Wait ~2 minutes for provisioning

### 2. Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy entire contents of `supabase/schema.sql`
4. Paste and click "Run"
5. You should see "Success. No rows returned"

### 3. Configure Authentication

1. Go to **Authentication → Providers**
2. Enable these providers:
   - ✅ **Email** (already enabled)
   - ✅ **Google** (optional but recommended)
   - ✅ **GitHub** (optional)

#### Google OAuth Setup (Optional):
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Create OAuth 2.0 credentials
- Add authorized redirect URI from Supabase
- Copy Client ID and Secret to Supabase

### 4. Get API Keys

1. Go to **Project Settings → API**
2. Copy these values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon/public key:** (safe for frontend)
   - **service_role key:** (keep secret! server-only)

3. Create `.env.local` in your project root:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

---

## 📊 Database Schema Overview

### Tables Created:

1. **profiles** - User profile data (extends auth.users)
2. **user_settings** - User preferences (currency, notifications, etc.)
3. **transactions** - All income/expense transactions
4. **budgets** - Budget limits per category
5. **goals** - Savings goals with progress tracking
6. **bills** - Bill reminders and recurring payments
7. **recurring_transactions** - Template for auto-generating transactions
8. **spending_alerts** - Notifications for unusual spending, budget warnings, etc.
9. **goal_milestones** - Track 25%, 50%, 75%, 100% achievements

### Key Features:

✅ **Row Level Security (RLS)** - Users can only access their own data
✅ **Real-time subscriptions** - Changes sync instantly across devices
✅ **Automatic timestamps** - created_at/updated_at managed automatically
✅ **Goal milestone tracking** - Automatic celebration triggers
✅ **Budget monitoring** - Built-in functions to track spending vs budgets
✅ **Indexes optimized** - Fast queries on large datasets

---

## 🔐 Security Features

### Row Level Security (RLS)

Every table has policies ensuring:
- Users can only SELECT their own data
- Users can only INSERT/UPDATE/DELETE their own data
- No user can access another user's financial data

### Authentication

- JWT tokens automatically handled by Supabase
- Secure session management
- Optional 2FA support
- Social OAuth (Google, GitHub)

---

## 🎯 Database Functions

### `get_spending_by_category(user_id, start_date, end_date)`
Returns spending breakdown by category for a date range.

**Usage:**
```sql
SELECT * FROM get_spending_by_category(
  'user-uuid-here',
  '2026-01-01',
  '2026-01-31'
);
```

### `get_budget_status(user_id, start_date, end_date)`
Returns budget vs actual spending for all categories.

**Usage:**
```sql
SELECT * FROM get_budget_status(
  'user-uuid-here',
  '2026-01-01',
  '2026-01-31'
);
```

---

## 🔄 Real-time Subscriptions

Supabase automatically provides real-time updates. You can subscribe to changes:

```javascript
const subscription = supabase
  .channel('transactions-channel')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'transactions' },
    (payload) => {
      console.log('Transaction changed:', payload);
    }
  )
  .subscribe();
```

---

## 📱 Multi-Device Sync

With this setup:
- ✅ Changes on phone sync to desktop instantly
- ✅ Offline changes queue and sync when online
- ✅ Conflict resolution handled by Supabase
- ✅ Same data across all devices

---

## 🧪 Testing Your Setup

### Test 1: Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see: bills, budgets, goal_milestones, goals, profiles, recurring_transactions, spending_alerts, transactions, user_settings

### Test 2: Check RLS is Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`

---

## 🆘 Troubleshooting

### Error: "permission denied for table X"
- Check that RLS policies are created
- Verify you're authenticated
- Check that `auth.uid()` matches `user_id`

### Error: "duplicate key value violates unique constraint"
- Check for existing data with same unique fields
- May need to update instead of insert

### No data showing up
- Verify RLS policies are correct
- Check browser console for auth errors
- Ensure `user_id` matches authenticated user

---

## 📚 Next Steps

After setup:
1. ✅ Create Supabase client in React
2. ✅ Add authentication UI (login/signup)
3. ✅ Migrate localStorage data to Supabase
4. ✅ Add real-time sync
5. ✅ Test multi-device sync

---

## 🔗 Useful Links

- [Supabase Docs](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
- [JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)
