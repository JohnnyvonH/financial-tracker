# Financial Tracker

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

A modern, responsive financial dashboard application that helps you take control of your personal finances. Built with React and Vite, this application provides an intuitive interface for tracking income, expenses, and savings goals.

## 🚀 Live Demo

> **Coming Soon**: Live demo will be available at `https://johnnyvonh.github.io/financial-tracker/`

## 📸 Screenshots

> **Note**: Screenshots will be added soon. See [docs/DEMO_ASSETS.md](docs/DEMO_ASSETS.md) for instructions on creating demo assets.

<!-- Uncomment and add your screenshots here
### Dashboard View
![Dashboard](docs/images/dashboard-screenshot.png)

### Mobile View
<img src="docs/images/mobile-view.png" width="300" alt="Mobile View">

### Demo
![Demo](docs/images/demo.gif)
-->

## Overview

Financial Tracker is a client-side web application designed to provide a seamless financial management experience without the need for backend infrastructure. All data is securely stored in your browser's local storage, ensuring privacy and instant access to your financial information.

## ✨ Key Features

### 📊 Real-Time KPI Dashboard
Get instant visibility into your financial health with key performance indicators:
- Current account balance
- Monthly income tracking
- Monthly expense monitoring
- Visual progress indicators

### 💰 Transaction Management
- Record income and expenses with detailed categorization
- Add descriptions and amounts for each transaction
- View transaction history with intuitive filtering
- Track spending patterns across categories
- Delete transactions with confirmation

### 🎯 Savings Goals
- Create multiple savings goals with target amounts
- Track progress toward each goal with visual indicators
- Monitor how close you are to achieving your financial objectives
- Update goal progress as you save
- Delete completed or outdated goals

### 💾 Data Management
- **Export Data**: Download your financial data as JSON backup files
- **Import Data**: Restore data from previous exports
- **Local Storage**: All data stored locally in your browser
- **Privacy-First**: Your data never leaves your device
- **Instant Performance**: No network delays or server requirements

### 🔔 Smart Notifications
- Real-time feedback for all actions
- Success confirmations for transactions and goals
- Error handling with helpful messages
- Non-intrusive toast notifications

### 🎨 Modern User Interface
- Beautiful gradient design with smooth animations
- Intuitive navigation and user experience
- Clean, minimalist aesthetic
- Accessible and easy to use
- Visual feedback on all interactions

### 📱 Fully Responsive
- Optimized for desktop, tablet, and mobile devices
- Adaptive layout that works on any screen size
- Touch-friendly controls for mobile users

## 🛠️ Technology Stack

- **React 18** - Modern UI library with hooks and functional components
- **Vite** - Lightning-fast build tool and development server
- **Lucide React** - Beautiful, consistent icon library
- **localStorage API** - Browser-native data persistence
- **CSS3** - Custom styling with gradients and animations

## 📁 Project Architecture

```
financial-tracker/
├── src/
│   ├── components/         # Reusable React components
│   │   ├── Header.jsx      # Application header with navigation
│   │   ├── KPICards.jsx    # Dashboard KPI display
│   │   ├── Goals.jsx       # Savings goals section
│   │   ├── Transactions.jsx # Transaction list
│   │   ├── TransactionForm.jsx # Add transaction form
│   │   ├── GoalForm.jsx    # Add goal form
│   │   ├── DataManagement.jsx # Export/Import interface
│   │   └── Notification.jsx # Toast notifications
│   ├── services/           # Business logic layer
│   │   └── storage.js      # localStorage abstraction with export/import
│   ├── styles/             # Application styling
│   │   └── index.css       # Global styles
│   ├── App.jsx             # Root application component
│   └── main.jsx            # Application entry point
├── docs/                   # Documentation and assets
│   ├── images/             # Screenshots and demo files
│   └── DEMO_ASSETS.md      # Guide for creating demo assets
├── dist/                   # Production build output
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── .env.example            # Environment variables template
├── SETUP.md                # Detailed setup instructions
└── README.md               # This file
```

## 🏗️ Component Architecture

The application follows a component-based architecture with clear separation of concerns:

- **Presentational Components**: Header, KPICards, Goals, Transactions
- **Form Components**: TransactionForm, GoalForm, DataManagement
- **Utility Components**: Notification
- **Service Layer**: Storage abstraction for data operations
- **State Management**: React hooks (useState, useEffect) for local state

## 💾 Data Model

The application manages three primary data entities:

1. **Transactions**: Records of income and expenses with category, amount, date, and description
2. **Goals**: Savings targets with current progress and target amounts
3. **Balance**: Automatically calculated from transaction history

## 🌐 Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Any modern browser with localStorage support

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

For detailed setup, deployment instructions, and IDE configuration, see [SETUP.md](SETUP.md).

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Complete setup and deployment guide
- **[docs/DEMO_ASSETS.md](docs/DEMO_ASSETS.md)** - Instructions for creating screenshots and demos
- **[.env.example](.env.example)** - Environment variables template

## 🔮 Future Enhancements

Potential improvements and features under consideration:

### High Priority
- **Budget Planning**: Monthly budget creation and tracking with alerts
- **Charts & Analytics**: Visual representations of spending patterns over time
- **Recurring Transactions**: Automated monthly income/expenses
- **Category Management**: User-defined transaction categories
- **Search & Filter**: Advanced search across all transactions

### Medium Priority
- **Multi-Currency Support**: Handle multiple currencies with conversion
- **Dark Mode**: Alternative color scheme for low-light environments
- **Data Reports**: Monthly/yearly financial reports and summaries
- **Transaction Editing**: Modify existing transactions
- **Goal Milestones**: Track progress with intermediate milestones

### Future Considerations
- **Backend Integration**: Optional cloud sync with Firebase or custom API
- **Multi-User Support**: Shared budgets for families or roommates
- **Bank Integration**: Connect to bank accounts (requires backend)
- **Bill Reminders**: Notifications for upcoming bills
- **Investment Tracking**: Track stocks, crypto, and other investments

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

See [LICENSE](LICENSE) file for details.

## 💬 Support

For questions, issues, or feature requests, please [open an issue](https://github.com/JohnnyvonH/financial-tracker/issues) on GitHub.

## 🙏 Acknowledgments

- [React](https://react.dev) - UI library
- [Vite](https://vitejs.dev) - Build tool
- [Lucide](https://lucide.dev) - Icon library
- [Shields.io](https://shields.io) - README badges

---

**⚠️ Important Note**: This application stores all data locally in your browser. Make sure to regularly export your data for backup purposes. If you clear your browser data or use a different device, you'll need to import your backup to access your financial information.

---

Made with ❤️ by [JohnnyvonH](https://github.com/JohnnyvonH)