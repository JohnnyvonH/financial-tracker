/**
 * Generate AI-powered insights from financial data
 */
export function generateInsights(transactions, budgets) {
  const insights = [];
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  // Get this month's transactions
  const thisMonthTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear;
  });

  // Get last month's transactions
  const lastMonthTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === lastMonth && tDate.getFullYear() === lastMonthYear;
  });

  // Calculate spending by category this month
  const thisMonthSpending = {};
  thisMonthTransactions.forEach(t => {
    if (t.type === 'expense') {
      thisMonthSpending[t.category] = (thisMonthSpending[t.category] || 0) + t.amount;
    }
  });

  // Calculate spending by category last month
  const lastMonthSpending = {};
  lastMonthTransactions.forEach(t => {
    if (t.type === 'expense') {
      lastMonthSpending[t.category] = (lastMonthSpending[t.category] || 0) + t.amount;
    }
  });

  // INSIGHT 1: Month-over-month spending changes
  Object.keys(thisMonthSpending).forEach(category => {
    const thisAmount = thisMonthSpending[category];
    const lastAmount = lastMonthSpending[category] || 0;
    
    if (lastAmount > 0) {
      const percentChange = ((thisAmount - lastAmount) / lastAmount) * 100;
      
      if (percentChange > 30) {
        insights.push({
          type: 'increase',
          title: `${category} spending increased`,
          message: `You spent ${percentChange.toFixed(0)}% more on ${category} this month (£${thisAmount.toFixed(2)}) compared to last month (£${lastAmount.toFixed(2)}).`
        });
      } else if (percentChange < -30) {
        insights.push({
          type: 'decrease',
          title: `Great job on ${category}!`,
          message: `You reduced ${category} spending by ${Math.abs(percentChange).toFixed(0)}% this month. Keep it up!`
        });
      }
    }
  });

  // INSIGHT 2: Budget warnings
  Object.entries(budgets).forEach(([category, budget]) => {
    const spent = thisMonthSpending[category] || 0;
    const percentage = (spent / budget) * 100;
    
    if (percentage >= 90 && percentage < 100) {
      insights.push({
        type: 'warning',
        title: `${category} budget almost reached`,
        message: `You've used ${percentage.toFixed(0)}% of your ${category} budget. £${(budget - spent).toFixed(2)} remaining.`
      });
    } else if (percentage >= 100) {
      insights.push({
        type: 'warning',
        title: `${category} budget exceeded`,
        message: `You're £${(spent - budget).toFixed(2)} over your ${category} budget this month.`
      });
    }
  });

  // INSIGHT 3: Unused subscriptions (transactions that repeat monthly)
  const subscriptionKeywords = ['netflix', 'spotify', 'prime', 'subscription', 'membership', 'hulu', 'disney'];
  const possibleSubscriptions = thisMonthTransactions.filter(t => 
    t.type === 'expense' && 
    subscriptionKeywords.some(keyword => 
      t.description.toLowerCase().includes(keyword)
    )
  );

  if (possibleSubscriptions.length > 0) {
    const totalSubscriptionCost = possibleSubscriptions.reduce((sum, t) => sum + t.amount, 0);
    insights.push({
      type: 'tip',
      title: 'Review your subscriptions',
      message: `You have ${possibleSubscriptions.length} subscription(s) costing £${totalSubscriptionCost.toFixed(2)}/month. Consider canceling unused ones.`
    });
  }

  // INSIGHT 4: Savings goal progress
  const thisMonthIncome = thisMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const thisMonthExpenses = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = thisMonthIncome - thisMonthExpenses;
  const savingsRate = thisMonthIncome > 0 ? (netSavings / thisMonthIncome) * 100 : 0;

  if (savingsRate >= 20) {
    insights.push({
      type: 'success',
      title: 'Excellent savings rate!',
      message: `You're saving ${savingsRate.toFixed(0)}% of your income this month. That's fantastic!`
    });
  } else if (savingsRate < 10 && savingsRate > 0) {
    insights.push({
      type: 'tip',
      title: 'Boost your savings',
      message: `Your savings rate is ${savingsRate.toFixed(0)}%. Try to aim for at least 20% to build financial security.`
    });
  } else if (netSavings < 0) {
    insights.push({
      type: 'warning',
      title: 'Spending more than earning',
      message: `You're spending £${Math.abs(netSavings).toFixed(2)} more than you're earning this month. Review your expenses.`
    });
  }

  // INSIGHT 5: Top spending day
  const spendingByDay = {};
  thisMonthTransactions.filter(t => t.type === 'expense').forEach(t => {
    const day = new Date(t.date).toLocaleDateString();
    spendingByDay[day] = (spendingByDay[day] || 0) + t.amount;
  });

  const topSpendingDay = Object.entries(spendingByDay)
    .sort((a, b) => b[1] - a[1])[0];

  if (topSpendingDay && topSpendingDay[1] > 100) {
    insights.push({
      type: 'tip',
      title: 'Highest spending day',
      message: `You spent £${topSpendingDay[1].toFixed(2)} on ${topSpendingDay[0]}. Consider spreading large purchases over time.`
    });
  }

  return insights;
}
