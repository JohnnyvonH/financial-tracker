import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { getCategoryIcon } from '../utils/categories';

export default function CalendarView({ transactions, currency = 'USD' }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  // Group transactions by date
  const transactionsByDate = {};
  transactions.forEach(t => {
    const date = new Date(t.date);
    if (date.getFullYear() === year && date.getMonth() === month) {
      const day = date.getDate();
      if (!transactionsByDate[day]) {
        transactionsByDate[day] = { income: 0, expenses: 0, transactions: [] };
      }
      transactionsByDate[day].transactions.push(t);
      if (t.type === 'income') {
        transactionsByDate[day].income += t.amount;
      } else {
        transactionsByDate[day].expenses += t.amount;
      }
    }
  });

  // Get transactions for selected date
  const selectedTransactions = selectedDate ? (transactionsByDate[selectedDate]?.transactions || []) : [];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="text-primary" size={28} />
          <h2 className="text-2xl font-light">Calendar View</h2>
        </div>
        <button onClick={goToToday} className="btn btn-sm btn-primary">
          Today
        </button>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={goToPreviousMonth} className="btn-icon">
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {monthNames[month]} {year}
        </h3>
        <button onClick={goToNextMonth} className="btn-icon">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid mb-6">
        {/* Day Names */}
        {dayNames.map(day => (
          <div key={day} className="calendar-day-name">
            {day}
          </div>
        ))}

        {/* Empty cells for days before month starts */}
        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="calendar-day calendar-day-empty" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dayData = transactionsByDate[day];
          const isToday = 
            day === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();
          const isSelected = day === selectedDate;
          const hasTransactions = dayData && dayData.transactions.length > 0;

          return (
            <div
              key={day}
              onClick={() => setSelectedDate(day)}
              className={`calendar-day ${
                isToday ? 'calendar-day-today' : ''
              } ${
                isSelected ? 'calendar-day-selected' : ''
              } ${
                hasTransactions ? 'calendar-day-has-transactions' : ''
              }`}
            >
              <div className="calendar-day-number">{day}</div>
              {hasTransactions && (
                <div className="calendar-day-indicators">
                  {dayData.income > 0 && (
                    <div className="calendar-indicator calendar-indicator-income" />
                  )}
                  {dayData.expenses > 0 && (
                    <div className="calendar-indicator calendar-indicator-expense" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="calendar-details">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            {monthNames[month]} {selectedDate}, {year}
          </h3>
          
          {selectedTransactions.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }} className="text-center py-4">
              No transactions on this day
            </p>
          ) : (
            <div className="space-y-2">
              {selectedTransactions.map((transaction, index) => {
                const categoryInfo = getCategoryIcon(transaction.category);
                const CategoryIcon = categoryInfo.icon;
                
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: '2rem',
                          height: '2rem',
                          borderRadius: '0.5rem',
                          backgroundColor: `${categoryInfo.color}20`,
                          color: categoryInfo.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <CategoryIcon size={16} />
                      </div>
                      <div>
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {transaction.description}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {transaction.category}
                        </div>
                      </div>
                    </div>
                    <div
                      className="font-bold"
                      style={{ color: transaction.type === 'income' ? 'var(--success)' : 'var(--danger)' }}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount, currency)}
                    </div>
                  </div>
                );
              })}
              
              {/* Summary */}
              <div
                className="mt-4 p-3 rounded-lg"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
              >
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: 'var(--text-secondary)' }}>Total Income</span>
                  <span style={{ color: 'var(--success)' }} className="font-semibold">
                    +{formatCurrency(transactionsByDate[selectedDate].income, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Total Expenses</span>
                  <span style={{ color: 'var(--danger)' }} className="font-semibold">
                    -{formatCurrency(transactionsByDate[selectedDate].expenses, currency)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
