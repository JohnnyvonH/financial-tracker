import { 
  ShoppingCart, 
  Home, 
  Zap, 
  Car, 
  Utensils, 
  Plane, 
  Heart, 
  GraduationCap, 
  Shirt, 
  Smartphone, 
  Coffee,
  Film,
  Dumbbell,
  ShoppingBag,
  Briefcase,
  Banknote
} from 'lucide-react';

export const CATEGORY_ICONS = {
  'Food & Dining': { icon: Utensils, color: '#f59e0b' },
  'Shopping': { icon: ShoppingCart, color: '#8b5cf6' },
  'Housing': { icon: Home, color: '#3b82f6' },
  'Utilities': { icon: Zap, color: '#06b6d4' },
  'Transportation': { icon: Car, color: '#10b981' },
  'Travel': { icon: Plane, color: '#6366f1' },
  'Healthcare': { icon: Heart, color: '#ef4444' },
  'Education': { icon: GraduationCap, color: '#8b5cf6' },
  'Clothing': { icon: Shirt, color: '#ec4899' },
  'Entertainment': { icon: Film, color: '#f97316' },
  'Technology': { icon: Smartphone, color: '#64748b' },
  'Fitness': { icon: Dumbbell, color: '#10b981' },
  'Groceries': { icon: ShoppingBag, color: '#22c55e' },
  'Coffee & Drinks': { icon: Coffee, color: '#78350f' },
  'Salary': { icon: Briefcase, color: '#10b981' },
  'Other Income': { icon: Banknote, color: '#3b82f6' },
  'Other': { icon: ShoppingCart, color: '#64748b' }
};

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Shopping',
  'Housing',
  'Utilities',
  'Transportation',
  'Travel',
  'Healthcare',
  'Education',
  'Clothing',
  'Entertainment',
  'Technology',
  'Fitness',
  'Coffee & Drinks',
  'Other'
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Other Income'
];

export const getCategoryIcon = (category) => {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS['Other'];
};
