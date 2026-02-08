# 💰 Financial Tracker

> A professional-grade personal finance management application built with React

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### 🎯 Core Functionality
- **Transaction Management** - Track income and expenses with categories
- **Budget Tracking** - Set and monitor category budgets with visual progress
- **Savings Goals** - Create and track multiple financial goals
- **Recurring Transactions** - Automate regular income/expenses
- **Smart Insights** - AI-powered spending analysis and recommendations
- **Bill Reminders** - Never miss a payment with due date tracking

### 📊 Analytics & Visualization
- **Enhanced Charts** - Monthly trends, category breakdowns, income vs expenses
- **Calendar View** - Visual timeline of your financial activity
- **Reports** - Comprehensive analytics and export capabilities
- **Real-time KPIs** - Instant overview of your financial health

### 🎨 User Experience
- **Dark/Light Mode** - Toggle between professional dark and light themes
- **Quick Add FAB** - Floating action button for instant transaction entry
- **Responsive Design** - Perfect on desktop, tablet, and mobile
- **Smooth Animations** - Professional transitions and interactions

### 💾 Data Management
- **CSV Import** - Bulk import from bank statements
- **JSON Export/Import** - Full backup and restore
- **Multi-Currency** - Support for 17+ currencies
- **Local Storage** - Your data stays private on your device

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/JohnnyvonH/financial-tracker.git
cd financial-tracker

# Install dependencies
npm install

# Start development server
npm start

# Open http://localhost:3000
```

### Build for Production

```bash
# Create optimized build
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 📖 Usage Guide

### Getting Started

1. **Set Your Currency** - Go to Settings and select your preferred currency
2. **Add Transactions** - Click the "+" FAB button or go to Transactions page
3. **Create Budgets** - Set monthly spending limits per category
4. **Set Goals** - Define your savings targets
5. **Review Insights** - Check the Dashboard for AI-powered recommendations

### Importing Bank Data

1. Export transactions from your bank as CSV
2. Go to Settings → Import from CSV
3. Select your CSV file
4. Preview and confirm import

CSV format should include: Date, Description, Amount, Category (optional)

### Best Practices

- **Daily Entry** - Add transactions daily for accurate tracking
- **Use Categories** - Consistent categorization improves insights
- **Set Realistic Budgets** - Start conservative, adjust as needed
- **Review Weekly** - Check your Dashboard and Reports regularly
- **Export Regularly** - Create backups of your financial data

## 🛠️ Technology Stack

- **Frontend**: React 18 with Hooks
- **Styling**: Custom CSS with CSS Variables
- **Icons**: Lucide React
- **Storage**: Browser LocalStorage
- **Charts**: Custom SVG visualizations
- **Build**: Create React App
- **Deployment**: GitHub Pages

## 📁 Project Structure

```
financial-tracker/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Transactions.jsx
│   │   ├── Budget.jsx
│   │   ├── Goals.jsx
│   │   ├── SmartInsights.jsx
│   │   ├── BillReminders.jsx
│   │   ├── EnhancedCharts.jsx
│   │   ├── CalendarView.jsx
│   │   ├── CSVImport.jsx
│   │   ├── QuickAddFAB.jsx
│   │   ├── ThemeToggle.jsx
│   │   └── ...
│   ├── utils/
│   │   ├── currency.js
│   │   ├── categories.js
│   │   ├── insights.js
│   │   ├── chartData.js
│   │   └── csvParser.js
│   ├── styles/
│   │   ├── index.css
│   │   └── new-features.css
│   ├── App.jsx
│   └── index.js
├── package.json
└── README.md
```

## 🎨 Customization

### Changing Theme Colors

Edit `src/styles/index.css`:

```css
:root {
  --primary: #10b981;      /* Main accent color */
  --accent: #06b6d4;       /* Secondary accent */
  --success: #10b981;      /* Success states */
  --danger: #ef4444;       /* Error states */
  --warning: #f59e0b;      /* Warning states */
}
```

### Adding Categories

Edit `src/utils/categories.js`:

```javascript
export const categories = [
  { name: 'Your Category', icon: YourIcon, color: '#color' },
  // Add more categories
];
```

### Adding Currencies

Edit `src/utils/currency.js`:

```javascript
export const CURRENCIES = [
  { code: 'XYZ', name: 'Your Currency', symbol: 'X' },
  // Add more currencies
];
```

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Johnny von Holstein**
- GitHub: [@JohnnyvonH](https://github.com/JohnnyvonH)

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Inspired by modern fintech apps like Robinhood, Revolut, and Stripe
- Built with Create React App

## 📧 Support

If you have questions or need help, please open an issue on GitHub.

---

**Happy Financial Tracking! 💰📊**
