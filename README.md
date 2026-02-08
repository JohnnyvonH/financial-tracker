# 💰 Financial Tracker

A modern, feature-rich personal finance management application built with React. Track income, expenses, budgets, savings goals, and recurring transactions with beautiful visualizations and insights.

![Financial Tracker](https://img.shields.io/badge/React-18+-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-active-success)

## ✨ Features

### 💵 Transaction Management
- **Add Transactions**: Record income and expenses with detailed categorization
- **Category Icons**: Visual color-coded icons for 17+ categories
- **Search & Filter**: Find transactions by text, date range, type, and category
- **Date Range Filters**: View transactions from last 7, 30, 90 days, or all time
- **CSV Export**: Export your transaction history to CSV for Excel/Sheets
- **Delete & Edit**: Manage your transaction history with ease

### 🔄 Recurring Transactions
- **Automated Transactions**: Set up recurring income or expenses
- **Multiple Frequencies**: Daily, weekly, bi-weekly, monthly, quarterly, yearly
- **Start & End Dates**: Define when recurring transactions begin and end
- **Pause/Resume**: Temporarily pause recurring transactions
- **Auto-Processing**: Automatically creates transactions based on schedule
- **Smart Notifications**: Get notified when recurring transactions are processed

### 📊 Budget Management
- **Category Budgets**: Set monthly budgets for expense categories
- **Real-time Tracking**: See budget usage with progress bars
- **Budget Alerts**: Get warnings when approaching or exceeding budget limits (75%+ usage)
- **Budget Export**: Export budget data to CSV
- **Multi-Period Views**: Analyze budgets by month, quarter, or year

### 🎯 Savings Goals
- **Goal Tracking**: Set and track multiple savings goals
- **Progress Visualization**: Beautiful progress bars showing completion
- **Quick Updates**: Increment/decrement goal progress with quick buttons (+/-10, +/-100)
- **Goal Export**: Export your goals to CSV
- **Completion Tracking**: See remaining amount and percentage complete

### 📈 Reports & Analytics
- **Financial Reports**: Comprehensive period-based reports (month, quarter, year, all-time)
- **Month-over-Month Comparison**: Track spending trends
- **Savings Rate**: Calculate your savings percentage
- **Top Categories**: Identify your biggest spending categories
- **Spending Charts**: Visual pie charts and breakdowns
- **Average Transaction**: Understand your spending patterns
- **Export Options**: Export reports, goals, and budgets to CSV

### 🎨 User Experience
- **Dark Mode**: Toggle between light and dark themes
- **Toast Notifications**: Beautiful non-intrusive notifications
- **Loading States**: Smooth loading indicators
- **Error Handling**: Graceful error recovery with helpful messages
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Form Validation**: Inline validation with helpful error messages
- **Animations**: Smooth transitions and slide-in effects

### 🌍 Multi-Currency Support
- **24+ Currencies**: USD, EUR, GBP, JPY, CNY, AUD, CAD, CHF, INR, BRL, and more
- **Automatic Formatting**: Numbers format correctly for each currency
- **Persistent Settings**: Your currency choice is saved

### 💾 Data Management
- **Local Storage**: All data stored securely in your browser
- **JSON Export/Import**: Backup and restore your complete financial data
- **Data Validation**: Ensures data integrity on import
- **Clear Data**: Option to start fresh (with confirmation)
- **Auto-Save**: Changes are automatically saved

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JohnnyvonH/financial-tracker.git
   cd financial-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

## 📖 Usage Guide

### Adding a Transaction
1. Click "Transaction" button in the header
2. Select Income or Expense type
3. Enter amount, description, category, and date
4. Click "Add Transaction"

### Setting Up Recurring Transactions
1. Click "Recurring" button in the header
2. Choose transaction type (income/expense)
3. Enter amount, description, and category
4. Select frequency (daily, weekly, monthly, etc.)
5. Set start date and optional end date
6. Click "Create Recurring Transaction"

### Creating a Budget
1. Go to "Budget" tab
2. Click "Budgets" sub-tab
3. Click "Add Budget"
4. Select category and enter monthly budget amount
5. Track your spending against budgets on the dashboard

### Setting Savings Goals
1. Click "Goal" button in header
2. Enter goal name, target amount, and starting amount
3. Track progress on the dashboard
4. Use +/- buttons to update progress

### Viewing Reports
1. Go to "Reports" tab
2. Select time period (month, quarter, year, all-time)
3. View insights, charts, and statistics
4. Export data using CSV export buttons

### Changing Currency
1. Go to "Settings" tab
2. Select your preferred currency from dropdown
3. All amounts update automatically

### Enabling Dark Mode
1. Click the moon/sun icon in the header
2. Theme preference is saved automatically

## 🏗️ Project Structure

```
financial-tracker/
├── src/
│   ├── components/       # React components
│   │   ├── Budget.jsx
│   │   ├── BudgetManager.jsx
│   │   ├── BudgetWarnings.jsx
│   │   ├── DarkModeToggle.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── FormInput.jsx
│   │   ├── Goals.jsx
│   │   ├── Header.jsx
│   │   ├── KPICards.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── RecurringTransactionForm.jsx
│   │   ├── RecurringTransactionList.jsx
│   │   ├── ReportsPage.jsx
│   │   ├── SpendingChart.jsx
│   │   ├── Toast.jsx
│   │   ├── Transactions.jsx
│   │   └── ...
│   ├── services/         # Business logic
│   │   └── storage.js   # LocalStorage management
│   ├── utils/           # Utility functions
│   │   ├── categories.js    # Category icons & lists
│   │   ├── currency.js      # Currency formatting
│   │   ├── export.js        # CSV export utilities
│   │   ├── recurring.js     # Recurring logic
│   │   ├── theme.js         # Dark mode utilities
│   │   └── validation.js    # Form validation
│   ├── styles/          # CSS files
│   ├── App.jsx          # Main app component
│   └── main.jsx         # App entry point
├── public/              # Static assets
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 Categories

### Expense Categories (with icons)
- 🍽️ Food & Dining
- 🛒 Groceries
- 🛍️ Shopping
- 🏠 Housing
- ⚡ Utilities
- 🚗 Transportation
- ✈️ Travel
- ❤️ Healthcare
- 🎓 Education
- 👕 Clothing
- 🎬 Entertainment
- 📱 Technology
- 💪 Fitness
- ☕ Coffee & Drinks
- 📦 Other

### Income Categories
- 💼 Salary
- 💻 Freelance
- 🏢 Business
- 📈 Investment
- 💰 Other Income

## 🔧 Technologies Used

- **React 18+** - UI framework
- **Vite** - Build tool and dev server
- **Lucide React** - Icon library
- **LocalStorage API** - Data persistence
- **CSS3** - Styling with dark mode support

## 🌟 Key Features in Detail

### Recurring Transactions
Automate your regular income and expenses:
- **Set it and forget it**: Define once, process automatically
- **Flexible scheduling**: From daily bills to yearly subscriptions
- **Full control**: Pause, resume, or delete anytime
- **Smart processing**: Checks hourly for due transactions
- **End dates**: Optionally set expiration dates

### Advanced Filtering
Find exactly what you need:
- **Text search**: Search transaction descriptions
- **Date ranges**: Last 7, 30, 90 days, or custom
- **Category filter**: View specific spending categories
- **Type filter**: Income vs expenses
- **Combined filters**: Use multiple filters together

### Budget Intelligence
Stay on track with smart alerts:
- **75% warning**: Yellow alert when budget usage hits 75%
- **Over budget**: Red alert when exceeding budget
- **Real-time updates**: See changes instantly
- **Category breakdown**: Understand where money goes

### Data Portability
Your data, your way:
- **JSON backup**: Complete data export
- **CSV exports**: Individual exports for transactions, goals, budgets
- **Easy import**: Restore from JSON backup
- **Data validation**: Ensures integrity on import

## 🔒 Privacy & Security

- ✅ **100% Local**: All data stored in your browser
- ✅ **No Server**: No data sent to external servers
- ✅ **No Tracking**: No analytics or tracking scripts
- ✅ **Open Source**: Review the code yourself
- ✅ **Your Control**: Export, import, or delete anytime

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Built with modern React best practices
- Icons from Lucide React
- Inspired by modern finance apps

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/JohnnyvonH/financial-tracker/issues) page
2. Create a new issue with details
3. Or reach out via GitHub

## 🎯 Roadmap

Future enhancements under consideration:
- [ ] Cloud sync with authentication
- [ ] Mobile app (React Native)
- [ ] Bill reminders
- [ ] Receipt attachments
- [ ] Multi-user/household support
- [ ] Advanced analytics & predictions
- [ ] Bank integration (via open banking APIs)
- [ ] Investment tracking

---

**Made with ❤️ using React**

Star ⭐ this repository if you found it helpful!
