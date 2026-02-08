import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import KPICards from './components/KPICards';
import Goals from './components/Goals';
import Transactions from './components/Transactions';
import TransactionForm from './components/TransactionForm';
import GoalForm from './components/GoalForm';
import { storageService } from './services/storage';

function App() {
  const [data, setData] = useState({
    balance: 0,
    transactions: [],
    goals: []
  });
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const savedData = storageService.getData();
    setData(savedData);
    setLoading(false);
  }, []);

  // Save data whenever it changes
  const saveData = (newData) => {
    setData(newData);
    storageService.saveData(newData);
  };

  // Add transaction
  const addTransaction = (transaction) => {
    const newTransaction = {
      id: Date.now(),
      ...transaction,
      timestamp: Date.now()
    };

    const newBalance = transaction.type === 'income'
      ? data.balance + transaction.amount
      : data.balance - transaction.amount;

    saveData({
      ...data,
      balance: newBalance,
      transactions: [newTransaction, ...data.transactions]
    });

    setView('dashboard');
  };

  // Delete transaction
  const deleteTransaction = (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    const transaction = data.transactions.find(t => t.id === id);
    const newBalance = transaction.type === 'income'
      ? data.balance - transaction.amount
      : data.balance + transaction.amount;

    saveData({
      ...data,
      balance: newBalance,
      transactions: data.transactions.filter(t => t.id !== id)
    });
  };

  // Add goal
  const addGoal = (goal) => {
    const newGoal = {
      id: Date.now(),
      ...goal
    };

    saveData({
      ...data,
      goals: [...data.goals, newGoal]
    });

    setView('dashboard');
  };

  // Update goal progress
  const updateGoalProgress = (id, newCurrent) => {
    const updatedGoals = data.goals.map(g =>
      g.id === id ? { ...g, current: newCurrent } : g
    );

    saveData({
      ...data,
      goals: updatedGoals
    });
  };

  // Delete goal
  const deleteGoal = (id) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    saveData({
      ...data,
      goals: data.goals.filter(g => g.id !== id)
    });
  };

  // Clear all data
  const clearAllData = () => {
    if (!confirm('Are you sure you want to clear ALL data? This cannot be undone!')) return;

    storageService.clearData();
    setData({
      balance: 0,
      transactions: [],
      goals: []
    });
  };

  // Calculate monthly statistics
  const getMonthlyStats = () => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const monthlyTransactions = data.transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear;
    });

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { monthlyIncome, monthlyExpenses };
  };

  const { monthlyIncome, monthlyExpenses } = getMonthlyStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600 text-lg font-light">Loading your finances...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header 
        view={view} 
        setView={setView} 
        onClearData={clearAllData}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {view === 'dashboard' && (
          <>
            <KPICards
              balance={data.balance}
              monthlyIncome={monthlyIncome}
              monthlyExpenses={monthlyExpenses}
            />
            <Goals
              goals={data.goals}
              onUpdateGoal={updateGoalProgress}
              onDeleteGoal={deleteGoal}
            />
            <Transactions
              transactions={data.transactions}
              onDeleteTransaction={deleteTransaction}
            />
          </>
        )}

        {view === 'add-transaction' && (
          <TransactionForm
            onSubmit={addTransaction}
            onCancel={() => setView('dashboard')}
          />
        )}

        {view === 'add-goal' && (
          <GoalForm
            onSubmit={addGoal}
            onCancel={() => setView('dashboard')}
          />
        )}
      </div>
    </div>
  );
}

export default App;
