-- ================================================
-- FINANCIAL TRACKER - SUPABASE DATABASE SCHEMA
-- ================================================
-- This schema supports multi-device sync, real-time updates,
-- and secure user data isolation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- PROFILES TABLE
-- ================================================
-- Extended user profile linked to Supabase auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- USER SETTINGS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  first_day_of_week INTEGER DEFAULT 0, -- 0 = Sunday, 1 = Monday
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_alerts BOOLEAN DEFAULT TRUE,
  budget_alert_threshold INTEGER DEFAULT 80, -- Alert at 80% of budget
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ================================================
-- TRANSACTIONS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_id UUID, -- Links to recurring_transactions
  tags TEXT[], -- Array of tags for filtering
  receipt_url TEXT, -- Future: store receipt images
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);

-- ================================================
-- BUDGETS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  period TEXT DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'yearly')),
  rollover_enabled BOOLEAN DEFAULT FALSE, -- Future feature
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category, period)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);

-- ================================================
-- GOALS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount DECIMAL(12, 2) NOT NULL,
  current_amount DECIMAL(12, 2) DEFAULT 0,
  deadline DATE,
  category TEXT, -- vacation, emergency, debt, etc.
  priority INTEGER DEFAULT 0, -- 0 = low, 1 = medium, 2 = high
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_completed ON public.goals(is_completed);

-- ================================================
-- BILLS TABLE (Reminders)
-- ================================================
CREATE TABLE IF NOT EXISTS public.bills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  due_date DATE NOT NULL,
  frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('one-time', 'weekly', 'monthly', 'quarterly', 'yearly')),
  category TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  auto_pay BOOLEAN DEFAULT FALSE,
  reminder_days INTEGER DEFAULT 3, -- Remind X days before due
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bills_user_id ON public.bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON public.bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_paid ON public.bills(is_paid);

-- ================================================
-- RECURRING TRANSACTIONS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.recurring_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE, -- NULL = continues indefinitely
  last_generated_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recurring_user_id ON public.recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_active ON public.recurring_transactions(is_active);

-- ================================================
-- SPENDING ALERTS TABLE
-- ================================================
-- Track unusual spending patterns
CREATE TABLE IF NOT EXISTS public.spending_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL, -- 'budget_warning', 'unusual_spending', 'goal_milestone'
  category TEXT,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB, -- Store additional data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON public.spending_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_read ON public.spending_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON public.spending_alerts(created_at DESC);

-- ================================================
-- GOAL MILESTONES TABLE
-- ================================================
-- Track milestone achievements (25%, 50%, 75%, 100%)
CREATE TABLE IF NOT EXISTS public.goal_milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  percentage INTEGER NOT NULL CHECK (percentage IN (25, 50, 75, 100)),
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  celebrated BOOLEAN DEFAULT FALSE, -- Has user seen the celebration?
  UNIQUE(goal_id, percentage)
);

CREATE INDEX IF NOT EXISTS idx_milestones_goal_id ON public.goal_milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_milestones_user_id ON public.goal_milestones(user_id);

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================
-- Users can only access their own data

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spending_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User settings policies
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Budgets policies
CREATE POLICY "Users can view own budgets" ON public.budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON public.budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON public.budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON public.budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view own goals" ON public.goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.goals
  FOR DELETE USING (auth.uid() = user_id);

-- Bills policies
CREATE POLICY "Users can view own bills" ON public.bills
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bills" ON public.bills
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bills" ON public.bills
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bills" ON public.bills
  FOR DELETE USING (auth.uid() = user_id);

-- Recurring transactions policies
CREATE POLICY "Users can view own recurring" ON public.recurring_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring" ON public.recurring_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring" ON public.recurring_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring" ON public.recurring_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Spending alerts policies
CREATE POLICY "Users can view own alerts" ON public.spending_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON public.spending_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert alerts" ON public.spending_alerts
  FOR INSERT WITH CHECK (true); -- Allows system/functions to create alerts

-- Goal milestones policies
CREATE POLICY "Users can view own milestones" ON public.goal_milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones" ON public.goal_milestones
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert milestones" ON public.goal_milestones
  FOR INSERT WITH CHECK (true);

-- ================================================
-- FUNCTIONS & TRIGGERS
-- ================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON public.bills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_updated_at BEFORE UPDATE ON public.recurring_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Create default settings
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Check for goal milestones
CREATE OR REPLACE FUNCTION public.check_goal_milestones()
RETURNS TRIGGER AS $$
DECLARE
  progress_percent INTEGER;
  milestone_percentage INTEGER;
BEGIN
  -- Calculate progress percentage
  IF NEW.target_amount > 0 THEN
    progress_percent := FLOOR((NEW.current_amount / NEW.target_amount) * 100);
    
    -- Check each milestone
    FOREACH milestone_percentage IN ARRAY ARRAY[25, 50, 75, 100]
    LOOP
      -- If we've reached this milestone and haven't recorded it yet
      IF progress_percent >= milestone_percentage AND 
         NOT EXISTS (
           SELECT 1 FROM public.goal_milestones 
           WHERE goal_id = NEW.id AND percentage = milestone_percentage
         ) THEN
        -- Record the milestone
        INSERT INTO public.goal_milestones (goal_id, user_id, percentage)
        VALUES (NEW.id, NEW.user_id, milestone_percentage);
        
        -- Create an alert
        INSERT INTO public.spending_alerts (user_id, alert_type, message, severity, metadata)
        VALUES (
          NEW.user_id,
          'goal_milestone',
          format('Congratulations! You''ve reached %s%% of your "%s" goal!', milestone_percentage, NEW.name),
          'info',
          jsonb_build_object('goal_id', NEW.id, 'percentage', milestone_percentage)
        );
      END IF;
    END LOOP;
    
    -- Mark goal as completed if 100% reached
    IF progress_percent >= 100 AND NOT NEW.is_completed THEN
      NEW.is_completed := TRUE;
      NEW.completed_at := NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Check milestones when goal is updated
CREATE TRIGGER check_goal_milestones_trigger
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  WHEN (OLD.current_amount IS DISTINCT FROM NEW.current_amount)
  EXECUTE FUNCTION public.check_goal_milestones();

-- Function: Calculate spending by category for a period
CREATE OR REPLACE FUNCTION public.get_spending_by_category(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(
  category TEXT,
  total_amount DECIMAL(12, 2),
  transaction_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.category,
    SUM(t.amount) as total_amount,
    COUNT(*) as transaction_count
  FROM public.transactions t
  WHERE 
    t.user_id = p_user_id
    AND t.type = 'expense'
    AND t.date >= p_start_date
    AND t.date <= p_end_date
  GROUP BY t.category
  ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Get budget status
CREATE OR REPLACE FUNCTION public.get_budget_status(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(
  category TEXT,
  budget_amount DECIMAL(12, 2),
  spent_amount DECIMAL(12, 2),
  remaining DECIMAL(12, 2),
  percentage_used INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.category,
    b.amount as budget_amount,
    COALESCE(SUM(t.amount), 0) as spent_amount,
    b.amount - COALESCE(SUM(t.amount), 0) as remaining,
    CASE 
      WHEN b.amount > 0 THEN FLOOR((COALESCE(SUM(t.amount), 0) / b.amount) * 100)
      ELSE 0
    END as percentage_used
  FROM public.budgets b
  LEFT JOIN public.transactions t ON 
    t.user_id = b.user_id 
    AND t.category = b.category 
    AND t.type = 'expense'
    AND t.date >= p_start_date
    AND t.date <= p_end_date
  WHERE b.user_id = p_user_id
  GROUP BY b.id, b.category, b.amount
  ORDER BY percentage_used DESC;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- SAMPLE DATA (for testing - remove in production)
-- ================================================
-- This will be populated when users sign up
-- No default data needed
