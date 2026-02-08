# 🗄️ Supabase Database Setup Guide

This guide will help you set up the database tables for your Financial Tracker.

---

## 📋 Quick Setup (5 minutes)

### Step 1: Go to Supabase SQL Editor

1. Open your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Migration

1. Open the migration file: [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql)
2. **Copy the entire contents** of that file
3. **Paste it** into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)
5. Wait for "Success. No rows returned" message ✅

### Step 3: Verify Tables Created

1. Click **Table Editor** in the left sidebar
2. You should see these 5 new tables:
   - ✅ `transactions`
   - ✅ `goals`
   - ✅ `budgets`
   - ✅ `recurring_transactions`
   - ✅ `user_settings`

**Done!** Your database is ready! 🎉

---

## 🔍 What Was Created?

### **Tables**

#### 1. **transactions**
Stores all income and expense transactions
- Fields: `id`, `user_id`, `type`, `amount`, `category`, `description`, `date`, `timestamp`
- Indexed by: user, date, type, category

#### 2. **goals**
Savings goals with targets and deadlines
- Fields: `id`, `user_id`, `name`, `target_amount`, `current_amount`, `deadline`

#### 3. **budgets**
Monthly spending limits by category
- Fields: `id`, `user_id`, `category`, `monthly_limit`
- One budget per category per user

#### 4. **recurring_transactions**
Automatically recurring transactions (bills, salary)
- Fields: `id`, `user_id`, `type`, `amount`, `category`, `description`, `frequency`, `start_date`, `active`

#### 5. **user_settings**
User preferences and balance
- Fields: `user_id`, `currency`, `theme`, `balance`
- Auto-created when user signs up

### **Security**

✅ **Row Level Security (RLS) enabled** on all tables
- Users can ONLY see their own data
- Users can ONLY modify their own data
- Complete data isolation between users

### **Performance**

✅ **Indexes created** for fast queries:
- User ID lookups
- Date-based filtering
- Category grouping
- Transaction type filtering

### **Automation**

✅ **Triggers configured**:
- Auto-update `updated_at` timestamps
- Auto-create user settings on signup

---

## 🧪 Test Your Database

Once tables are created, test in Supabase:

### Test 1: Check RLS Policies

1. Go to **Authentication** → **Policies**
2. You should see policies for each table
3. All policies should reference `auth.uid()`

### Test 2: Try Inserting Data

1. Go to **Table Editor** → `transactions`
2. Try to insert a row without being authenticated
3. You should get a permission error ✅ (RLS working!)

### Test 3: Sign In and Insert

1. Sign in to your app
2. Add a transaction
3. Go to **Table Editor** → `transactions`
4. You should see your transaction! ✅

---

## 🔧 Troubleshooting

### Error: "relation already exists"

**Solution:** Tables already created! You're good to go.

### Error: "permission denied"

**Solution:** 
1. Make sure you're running the query as the **postgres** user
2. Check that RLS policies are created correctly

### Tables not showing up

**Solution:**
1. Refresh the Table Editor page
2. Check the SQL Editor for any error messages
3. Re-run the migration script

### Can't see data in Table Editor

**Solution:** This is normal! RLS protects data. Use the app to add data, or query with:
```sql
SELECT * FROM transactions WHERE user_id = 'your-user-id';
```

---

## 📊 Database Schema Diagram

```
┌─────────────────────┐
│   auth.users        │
│  (Supabase Auth)    │
└──────────┬──────────┘
           │
           │ user_id (Foreign Key)
           │
    ┌──────┴──────────────────────────┐
    │                                 │
    ▼                                 ▼
┌─────────────────┐          ┌──────────────────┐
│  transactions   │          │  user_settings   │
├─────────────────┤          ├──────────────────┤
│ • id (PK)       │          │ • user_id (PK)   │
│ • user_id (FK)  │          │ • currency       │
│ • type          │          │ • theme          │
│ • amount        │          │ • balance        │
│ • category      │          └──────────────────┘
│ • description   │
│ • date          │
│ • timestamp     │
└─────────────────┘
    │
    ├──────────────────┐
    │                  │
    ▼                  ▼
┌─────────────┐  ┌──────────────────────────┐
│   goals     │  │  recurring_transactions  │
├─────────────┤  ├──────────────────────────┤
│ • id (PK)   │  │ • id (PK)                │
│ • user_id   │  │ • user_id (FK)           │
│ • name      │  │ • type                   │
│ • target    │  │ • amount                 │
│ • current   │  │ • category               │
│ • deadline  │  │ • frequency              │
└─────────────┘  │ • start_date             │
                 │ • active                 │
    │            └──────────────────────────┘
    │
    ▼
┌─────────────┐
│  budgets    │
├─────────────┤
│ • id (PK)   │
│ • user_id   │
│ • category  │
│ • limit     │
└─────────────┘
```

---

## ✅ Next Steps

Once your database is set up:

1. ✅ Tables created and verified
2. ⏭️ App will automatically sync data to Supabase
3. ⏭️ Sign in and start using the app
4. ⏭️ Your data will be available across all devices!

---

## 🆘 Need Help?

If you run into issues:

1. Check the Supabase logs in the Dashboard
2. Verify your RLS policies are active
3. Make sure you're signed in when testing
4. Review the migration file for any syntax errors

**Pro tip:** You can always drop and recreate tables if needed:
```sql
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS recurring_transactions CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;

-- Then re-run the migration
```

---

You're all set! 🚀
