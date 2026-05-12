# 💰 Financial Tracker

> A modern, professional financial management application built with React, Supabase, and cloud synchronization.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://johnnyvonh.github.io/financial-tracker/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## ✨ Features

### 💳 Transaction Management
- ✅ Track income and expenses with categories
- ✅ Add descriptions and dates to transactions
- ✅ View transaction history with filtering
- ✅ Delete transactions with balance auto-update

### 🎯 Savings Goals
- ✅ Set savings targets with deadlines
- ✅ Track progress with visual indicators
- ✅ Update goal progress easily
- ✅ Achievement notifications

### 📊 Budget Management
- ✅ Set monthly spending limits per category
- ✅ Real-time budget warnings (80%, 90%, 100%)
- ✅ Visual budget vs. actual spending
- ✅ Category-based tracking

### 🔄 Recurring Transactions
- ✅ Set up automatic recurring bills/income
- ✅ Daily, weekly, monthly, yearly frequencies
- ✅ Pause/resume recurring transactions
- ✅ Automatic transaction generation

### 📈 Reports & Analytics
- ✅ Monthly spending trends
- ✅ Category-wise breakdown charts
- ✅ Income vs. expense comparisons
- ✅ Financial insights dashboard

### ☁️ Cloud Sync
- ✅ **Supabase integration** - Your data in the cloud
- ✅ **Cross-device sync** - Access from anywhere
- ✅ **Automatic backup** - Never lose your data
- ✅ **Offline support** - Works without internet
- ✅ **Google OAuth** - Secure authentication

### 🎨 User Experience
- ✅ **Dark/Light themes** - Easy on the eyes
- ✅ **Multi-currency support** - USD, EUR, GBP, etc.
- ✅ **Responsive design** - Works on all devices
- ✅ **PWA support** - Install as mobile app
- ✅ **Professional UI** - Modern, clean design

### 💾 Data Management
- ✅ Export data as JSON
- ✅ Import data from backups
- ✅ Clear all data option
- ✅ Local storage fallback

---

## 🚀 Live Demo

**Try it now:** [https://johnnyvonh.github.io/financial-tracker/](https://johnnyvonh.github.io/financial-tracker/)

---

## Product Screenshots

The screenshots below use the dedicated demo account dataset so product reviews, CI checks, and documentation can show realistic finances without mixing in personal data.

### Dashboard
![Financial Tracker dashboard](docs/screenshots/dashboard.png)

### Current Finances
![Current finances snapshot](docs/screenshots/current-finances.png)

### Planning And Goals
![Plan page](docs/screenshots/plan.png)

![Goals page](docs/screenshots/goals.png)

More captured views are available in [`docs/screenshots`](docs/screenshots), including transactions, budgets, reports, and settings.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite
- **Styling:** Custom CSS with modern design
- **Icons:** Lucide React
- **Authentication:** Supabase Auth + Google OAuth
- **Database:** Supabase PostgreSQL
- **Hosting:** GitHub Pages
- **Charts:** Custom SVG visualizations

---

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier)
- Google OAuth credentials (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/JohnnyvonH/financial-tracker.git
   cd financial-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Set up Supabase database**
   
   Follow the guide in [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:5173
   ```

---

## 🔧 Configuration

### Supabase Setup

See detailed instructions in [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)

**Quick steps:**
1. Create Supabase project
2. Run migration SQL (in `supabase/migrations/`)
3. Configure redirect URLs
4. Add environment variables

### Google OAuth Setup

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com)
2. Add to Supabase: **Authentication** → **Providers** → **Google**
3. Configure redirect URLs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:5173/`

---

## 📱 Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for complete deployment guide.

**GitHub Pages (automated):**
1. Push to `main` branch
2. GitHub Actions automatically builds and deploys
3. Live in 2-3 minutes!

---

## 🎯 Usage

### Getting Started

1. **Sign in** with Google (or use without account for local-only mode)
2. **Add your first transaction** using the "+ Transaction" button
3. **Set up budgets** in the Budget tab
4. **Create savings goals** with "+ Goal" button
5. **View reports** to analyze your spending

### Key Features

**Dashboard View:**
- View balance, income, expenses at a glance
- See budget warnings if overspending
- Track savings goal progress
- Recent transactions list

**Transactions Page:**
- Full transaction history
- Filter by date, category, type
- Search functionality
- Quick delete actions

**Budget Tab:**
- Set monthly limits per category
- See current spending vs. budget
- Visual progress bars
- Warning indicators

**Reports:**
- Monthly spending trends
- Category breakdowns
- Income vs. expense charts
- Financial summaries

---

## 🔒 Privacy & Security

- ✅ **Row Level Security** - Users only see their own data
- ✅ **Secure OAuth** - Google authentication
- ✅ **No tracking** - Your data stays private
- ✅ **Local storage backup** - Fallback option
- ✅ **Open source** - Transparent codebase

---

## 💰 Cost

**100% FREE for personal use!**

- Supabase Free Tier: 50,000 users, unlimited API requests
- Google OAuth: Free up to 50,000 MAU
- GitHub Pages: Free hosting

**Total monthly cost: $0** 🎉

See FAQ for details on limits.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Authentication by [Supabase](https://supabase.com/)
- Hosting by [GitHub Pages](https://pages.github.com/)
- Built with [React](https://react.dev/) and [Vite](https://vitejs.dev/)

---

## 📧 Contact

**Johnny von Holstein**
- GitHub: [@JohnnyvonH](https://github.com/JohnnyvonH)
- Email: johnnyvonh@gmail.com

---

## 🗺️ Roadmap

- [ ] Real-time sync across devices
- [ ] Receipt upload with OCR
- [ ] Bank account integration (Plaid/TrueLayer)
- [ ] AI-powered insights
- [ ] Mobile app (React Native)
- [ ] Investment tracking
- [ ] Tax export reports
- [ ] Shared budgets for families

---

**Built with ❤️ by Johnny von Holstein**
