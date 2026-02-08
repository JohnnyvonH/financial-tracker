# Financial Tracker

A modern, responsive financial dashboard application that helps you take control of your personal finances. Built with React and Vite, this application provides an intuitive interface for tracking income, expenses, and savings goals.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-646CFF)

## Overview

Financial Tracker is a client-side web application designed to provide a seamless financial management experience without the need for backend infrastructure. All data is securely stored in your browser's local storage, ensuring privacy and instant access to your financial information.

## Key Features

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

### 🎯 Savings Goals
- Create multiple savings goals with target amounts
- Track progress toward each goal with visual indicators
- Monitor how close you are to achieving your financial objectives
- Update goals as your financial situation evolves

### 💾 Data Persistence
- All data stored locally in your browser using localStorage
- No server or database required
- Privacy-first approach - your data never leaves your device
- Instant load times and offline functionality

### 🎨 Modern User Interface
- Beautiful gradient design with smooth animations
- Intuitive navigation and user experience
- Clean, minimalist aesthetic
- Accessible and easy to use

### 📱 Fully Responsive
- Optimized for desktop, tablet, and mobile devices
- Adaptive layout that works on any screen size
- Touch-friendly controls for mobile users

## Technology Stack

- **React 18** - Modern UI library with hooks and functional components
- **Vite** - Lightning-fast build tool and development server
- **Lucide React** - Beautiful, consistent icon library
- **localStorage API** - Browser-native data persistence
- **CSS3** - Custom styling with gradients and animations

## Project Architecture

```
financial-tracker/
├── src/
│   ├── components/         # Reusable React components
│   │   ├── Header.jsx      # Application header
│   │   ├── KPICards.jsx    # Dashboard KPI display
│   │   ├── Goals.jsx       # Savings goals section
│   │   ├── Transactions.jsx # Transaction list
│   │   ├── TransactionForm.jsx # Add transaction form
│   │   └── GoalForm.jsx    # Add goal form
│   ├── services/           # Business logic layer
│   │   └── storage.js      # localStorage abstraction
│   ├── styles/             # Application styling
│   │   └── index.css       # Global styles
│   ├── App.jsx             # Root application component
│   └── main.jsx            # Application entry point
├── dist/                   # Production build output
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
└── README.md
```

## Component Architecture

The application follows a component-based architecture with clear separation of concerns:

- **Presentational Components**: Header, KPICards, Goals, Transactions
- **Form Components**: TransactionForm, GoalForm
- **Service Layer**: Storage abstraction for data operations
- **State Management**: React hooks (useState, useEffect) for local state

## Data Model

The application manages three primary data entities:

1. **Transactions**: Records of income and expenses with category, amount, and description
2. **Goals**: Savings targets with current progress and target amounts
3. **Balance**: Calculated from transaction history

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Any modern browser with localStorage support

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

For detailed setup and deployment instructions, see [SETUP.md](SETUP.md).

## Future Enhancements

Potential improvements and features under consideration:

- **Data Export/Import**: JSON or CSV export for backup
- **Budget Planning**: Monthly budget creation and tracking
- **Charts & Analytics**: Visual representations of spending patterns
- **Recurring Transactions**: Automated monthly income/expenses
- **Multi-Currency Support**: Handle multiple currencies
- **Categories Customization**: User-defined transaction categories
- **Dark Mode**: Alternative color scheme option
- **Backend Integration**: Optional cloud sync with Firebase or custom API

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For questions, issues, or feature requests, please [open an issue](https://github.com/JohnnyvonH/financial-tracker/issues) on GitHub.

---

**Note**: This application stores all data locally in your browser. Make sure to export your data regularly if you want to keep backups or migrate to a different device.