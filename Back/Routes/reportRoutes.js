import express from 'express';
import { auth, checkRole } from '../Middleware/auth.js';
import User from '../Models/user.js';
import Account from '../Models/accounts.js';
import Transaction from '../Models/Transaction.js';
import Budget from '../Models/Budget.js';
import Goal from '../Models/Goal.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const router = express.Router();

// Helper function to format currency
const formatCurrency = (amount, currency) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD'
  }).format(amount);
};

// Helper function to calculate budget progress
const calculateBudgetProgress = (spent, budgetAmount) => {
  return Math.min((spent / budgetAmount) * 100, 100).toFixed(2);
};

// Generate monthly report for a user
router.get('/monthly', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month
    
    // Fetch user data
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Fetch accounts
    const accounts = await Account.find({ user: req.user.userId });
    
    // Fetch transactions for the month
    const transactions = await Transaction.find({
      user: req.user.userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    // Fetch budgets
    const budgets = await Budget.find({ user: req.user.userId });
    
    // Fetch goals
    const goals = await Goal.find({ user: req.user.userId });
    
    // Process and structure the data
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netCashflow = totalIncome - totalExpenses;
    
    // Categorize expenses
    const expensesByCategory = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!expensesByCategory[t.category]) {
          expensesByCategory[t.category] = 0;
        }
        expensesByCategory[t.category] += t.amount;
      });
    
    // Budget progress
    const budgetProgress = budgets.map(budget => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        category: budget.category,
        budgetAmount: budget.amount,
        spent,
        remaining: budget.amount - spent,
        progress: calculateBudgetProgress(spent, budget.amount),
        currency: budget.currency
      };
    });
    
    // Goal progress
    const goalProgress = goals.map(goal => {
      return {
        title: goal.title,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        progress: ((goal.currentAmount / goal.targetAmount) * 100).toFixed(2),
        remaining: goal.targetAmount - goal.currentAmount,
        deadline: goal.deadline,
        currency: goal.currency
      };
    });
    
    // Structure report data
    const reportData = {
      user: {
        name: user.name,
        email: user.email,
        preferedCurrency: user.preferedCurrency
      },
      period: {
        month: startDate.toLocaleString('default', { month: 'long' }),
        year
      },
      accounts: accounts.map(acc => ({
        name: acc.name,
        type: acc.type,
        balance: acc.balance,
        currency: acc.currency
      })),
      totalIncome,
      totalExpenses,
      netCashflow,
      expensesByCategory,
      budgetProgress,
      goalProgress,
      transactions: transactions.map(t => ({
        type: t.type,
        amount: t.amount,
        category: t.category,
        description: t.description,
        date: t.date,
        currency: t.currency
      }))
    };
    
    res.json({
      success: true,
      report: reportData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate annual report
router.get('/annual', auth, async (req, res) => {
  try {
    const { year } = req.query;
    
    if (!year) {
      return res.status(400).json({ message: 'Year is required' });
    }
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    // Fetch user data
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Fetch accounts
    const accounts = await Account.find({ user: req.user.userId });
    
    // Fetch transactions for the year
    const transactions = await Transaction.find({
      user: req.user.userId,
      date: { $gte: startDate, $lte: endDate }
    });
    
    // Fetch goals
    const goals = await Goal.find({ user: req.user.userId });
    
    // Process monthly data
    const monthlyData = Array(12).fill().map((_, i) => {
      const monthStart = new Date(year, i, 1);
      const monthEnd = new Date(year, i + 1, 0);
      
      const monthTransactions = transactions.filter(t => 
        t.date >= monthStart && t.date <= monthEnd
      );
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        month: monthStart.toLocaleString('default', { month: 'long' }),
        income,
        expenses,
        netCashflow: income - expenses
      };
    });
    
    // Annual totals
    const annualIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const annualExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const annualNetCashflow = annualIncome - annualExpenses;
    
    // Categorize annual expenses
    const expensesByCategory = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!expensesByCategory[t.category]) {
          expensesByCategory[t.category] = 0;
        }
        expensesByCategory[t.category] += t.amount;
      });
    
    // Structure report data
    const reportData = {
      user: {
        name: user.name,
        email: user.email,
        preferedCurrency: user.preferedCurrency
      },
      year,
      monthlyData,
      accounts: accounts.map(acc => ({
        name: acc.name,
        type: acc.type,
        balance: acc.balance,
        currency: acc.currency
      })),
      annualIncome,
      annualExpenses,
      annualNetCashflow,
      expensesByCategory,
      goals: goals.map(goal => ({
        title: goal.title,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        progress: ((goal.currentAmount / goal.targetAmount) * 100).toFixed(2),
        deadline: goal.deadline,
        currency: goal.currency
      }))
    };
    
    res.json({
      success: true,
      report: reportData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate PDF report for monthly data
router.get('/monthly/pdf', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const monthName = startDate.toLocaleString('default', { month: 'long' });
    
    // Fetch user data
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Fetch accounts
    const accounts = await Account.find({ user: req.user.userId });
    
    // Fetch transactions for the month
    const transactions = await Transaction.find({
      user: req.user.userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    // Fetch budgets
    const budgets = await Budget.find({ user: req.user.userId });
    
    // Process transactions
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Create a PDF document
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const reportDir = path.join(__dirname, '../reports');
    
    // Create reports directory if it doesn't exist
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const reportFilename = `${user.name.replace(/\s+/g, '_')}_${monthName}_${year}_report.pdf`;
    const reportPath = path.join(reportDir, reportFilename);
    
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(reportPath);
    doc.pipe(stream);
    
    // Add report content
    doc.fontSize(25).text(`Monthly Financial Report`, { align: 'center' });
    doc.fontSize(15).text(`${monthName} ${year}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated for: ${user.name} (${user.email})`);
    doc.moveDown();
    
    // Summary
    doc.fontSize(16).text('Summary', { underline: true });
    doc.fontSize(12).text(`Total Income: ${formatCurrency(income, user.preferedCurrency)}`);
    doc.fontSize(12).text(`Total Expenses: ${formatCurrency(expenses, user.preferedCurrency)}`);
    doc.fontSize(12).text(`Net Cashflow: ${formatCurrency(income - expenses, user.preferedCurrency)}`);
    doc.moveDown();
    
    // Accounts
    doc.fontSize(16).text('Accounts', { underline: true });
    accounts.forEach(account => {
      doc.fontSize(12).text(`${account.name} (${account.type}): ${formatCurrency(account.balance, account.currency)}`);
    });
    doc.moveDown();
    
    // Budget Progress
    doc.fontSize(16).text('Budget Progress', { underline: true });
    budgets.forEach(budget => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const progress = calculateBudgetProgress(spent, budget.amount);
      doc.fontSize(12).text(`${budget.category}: ${formatCurrency(spent, budget.currency)} of ${formatCurrency(budget.amount, budget.currency)} (${progress}%)`);
    });
    doc.moveDown();
    
    // Transactions
    doc.fontSize(16).text('Transactions', { underline: true });
    doc.moveDown();
    
    // Add a transactions table
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    if (incomeTransactions.length > 0) {
      doc.fontSize(14).text('Income');
      incomeTransactions.forEach(t => {
        const date = new Date(t.date).toLocaleDateString();
        doc.fontSize(10).text(`${date} | ${t.category} | ${formatCurrency(t.amount, t.currency)} | ${t.description || 'No description'}`);
      });
      doc.moveDown();
    }
    
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    if (expenseTransactions.length > 0) {
      doc.fontSize(14).text('Expenses');
      expenseTransactions.forEach(t => {
        const date = new Date(t.date).toLocaleDateString();
        doc.fontSize(10).text(`${date} | ${t.category} | ${formatCurrency(t.amount, t.currency)} | ${t.description || 'No description'}`);
      });
    }
    
    doc.end();
    
    stream.on('finish', () => {
      res.download(reportPath, reportFilename, (err) => {
        if (err) {
          res.status(500).json({ message: 'Error downloading file' });
        }
        
        // Clean up the file after download
        fs.unlink(reportPath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Error deleting temporary file:', unlinkErr);
          }
        });
      });
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate custom date range report
router.get('/custom', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    // Fetch user data
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Fetch transactions for the date range
    const transactions = await Transaction.find({
      user: req.user.userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });
    
    // Process transactions
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Categorize expenses
    const expensesByCategory = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!expensesByCategory[t.category]) {
          expensesByCategory[t.category] = 0;
        }
        expensesByCategory[t.category] += t.amount;
      });
    
    // Structure report data
    const reportData = {
      user: {
        name: user.name,
        email: user.email,
        preferedCurrency: user.preferedCurrency
      },
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      },
      totalIncome,
      totalExpenses,
      netCashflow: totalIncome - totalExpenses,
      expensesByCategory,
      transactions: transactions.map(t => ({
        type: t.type,
        amount: t.amount,
        category: t.category,
        description: t.description,
        date: t.date,
        currency: t.currency
      }))
    };
    
    res.json({
      success: true,
      report: reportData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate overall financial health report
router.get('/financial-health', auth, async (req, res) => {
  try {
    // Fetch user data
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Fetch accounts
    const accounts = await Account.find({ user: req.user.userId });
    
    // Calculate total assets
    const totalAssets = accounts.reduce((sum, account) => {
      // Simple conversion - in a real app, you'd use exchange rates
      return sum + (account.type !== 'credit' ? account.balance : 0);
    }, 0);
    
    // Calculate total liabilities
    const totalLiabilities = accounts.reduce((sum, account) => {
      return sum + (account.type === 'credit' ? Math.abs(account.balance) : 0);
    }, 0);
    
    // Calculate net worth
    const netWorth = totalAssets - totalLiabilities;
    
    // Get transactions for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentTransactions = await Transaction.find({
      user: req.user.userId,
      date: { $gte: sixMonthsAgo }
    });
    
    // Calculate average monthly income and expenses
    const monthlyData = {};
    
    recentTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expenses += transaction.amount;
      }
    });
    
    const months = Object.keys(monthlyData);
    const avgMonthlyIncome = months.length > 0
      ? months.reduce((sum, month) => sum + monthlyData[month].income, 0) / months.length
      : 0;
    
    const avgMonthlyExpenses = months.length > 0
      ? months.reduce((sum, month) => sum + monthlyData[month].expenses, 0) / months.length
      : 0;
    
    // Calculate savings rate
    const savingsRate = avgMonthlyIncome > 0
      ? ((avgMonthlyIncome - avgMonthlyExpenses) / avgMonthlyIncome * 100).toFixed(2)
      : 0;
    
    // Fetch goals for emergency fund assessment
    const goals = await Goal.find({ user: req.user.userId });
    const emergencyFund = goals.find(goal => 
      goal.title.toLowerCase().includes('emergency') || 
      goal.title.toLowerCase().includes('rainy day')
    );
    
    // Structure financial health data
    const financialHealthData = {
      user: {
        name: user.name,
        email: user.email,
        preferedCurrency: user.preferedCurrency
      },
      netWorth: {
        totalAssets,
        totalLiabilities,
        netWorth
      },
      cashFlow: {
        avgMonthlyIncome,
        avgMonthlyExpenses,
        monthlySavings: avgMonthlyIncome - avgMonthlyExpenses,
        savingsRate: `${savingsRate}%`
      },
      emergencyFund: emergencyFund ? {
        target: emergencyFund.targetAmount,
        current: emergencyFund.currentAmount,
        progress: `${((emergencyFund.currentAmount / emergencyFund.targetAmount) * 100).toFixed(2)}%`
      } : 'Not Found',
      recommendations: []
    };
    
    // Add recommendations based on financial health
    if (savingsRate < 10) {
      financialHealthData.recommendations.push(
        'Consider increasing your savings rate to at least 15-20% of your income'
      );
    }
    
    if (!emergencyFund) {
      financialHealthData.recommendations.push(
        'Create an emergency fund goal with 3-6 months of living expenses'
      );
    } else if (emergencyFund.currentAmount < emergencyFund.targetAmount * 0.5) {
      financialHealthData.recommendations.push(
        'Continue building your emergency fund to reach at least 3-6 months of expenses'
      );
    }
    
    if (totalLiabilities > totalAssets) {
      financialHealthData.recommendations.push(
        'Focus on reducing debt to improve your net worth'
      );
    }
    
    res.json({
      success: true,
      report: financialHealthData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin route to get all users' financial health - using your checkRole middleware pattern
router.get('/admin/users-overview', auth, checkRole(['admin']), async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find().select('-password');
    
    // Get summary data for each user
    const usersData = await Promise.all(users.map(async (user) => {
      // Get accounts 
      const accounts = await Account.find({ user: user._id });
      
      // Get total balance
      const totalBalance = accounts.reduce((sum, account) => {
        return sum + (account.type !== 'credit' ? account.balance : -account.balance);
      }, 0);
      
      // Get recent transactions
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const recentTransactions = await Transaction.find({
        user: user._id,
        date: { $gte: lastMonth }
      });
      
      const monthlyIncome = recentTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const monthlyExpenses = recentTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        accountsCount: accounts.length,
        totalBalance,
        currency: user.preferedCurrency,
        monthlyIncome,
        monthlyExpenses,
        monthlySavings: monthlyIncome - monthlyExpenses,
        lastActive: user.lastActive
      };
    }));
    
    res.json({
      success: true,
      usersCount: users.length,
      usersData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Category spending analysis report
router.get('/category-analysis', auth, async (req, res) => {
  try {
    const { period } = req.query; // 'month', 'quarter', 'year'
    
    // Determine date range based on period
    const endDate = new Date();
    let startDate = new Date();
    
    switch(period) {
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
      default:
        startDate.setFullYear(startDate.getFullYear() - 1);
    }
    
    // Fetch user data
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Fetch transactions for the period
    const transactions = await Transaction.find({
      user: req.user.userId,
      type: 'expense',
      date: { $gte: startDate, $lte: endDate }
    });
    
    // Categorize expenses
    const expensesByCategory = {};
    transactions.forEach(t => {
      if (!expensesByCategory[t.category]) {
        expensesByCategory[t.category] = 0;
      }
      expensesByCategory[t.category] += t.amount;
    });
    
    // Sort categories by amount spent
    const sortedCategories = Object.entries(expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({ category, amount }));
    
    // Calculate total expenses and percentages
    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    const categoryBreakdown = sortedCategories.map(item => ({
      ...item,
      percentage: ((item.amount / totalExpenses) * 100).toFixed(2)
    }));
    
    // Get weekly/monthly trend if available
    const trend = {};
    
    if (period === 'year') {
      // Monthly trend for yearly report
      for (let i = 0; i < 12; i++) {
        const monthStart = new Date(startDate);
        monthStart.setMonth(startDate.getMonth() + i);
        
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthStart.getMonth() + 1);
        monthEnd.setDate(0); // Last day of the month
        
        const monthlyTransactions = transactions.filter(t => 
          t.date >= monthStart && t.date <= monthEnd
        );
        
        const monthTotal = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
        
        trend[monthStart.toLocaleString('default', { month: 'short' })] = monthTotal;
      }
    } else {
      // Weekly trend for shorter periods
      const weeks = Math.ceil((endDate - startDate) / (7 * 24 * 60 * 60 * 1000));
      
      for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(weekStart.getDate() + (i * 7));
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        if (weekEnd > endDate) {
          weekEnd.setTime(endDate.getTime());
        }
        
        const weeklyTransactions = transactions.filter(t => 
          t.date >= weekStart && t.date <= weekEnd
        );
        
        const weekTotal = weeklyTransactions.reduce((sum, t) => sum + t.amount, 0);
        
        trend[`Week ${i + 1}`] = weekTotal;
      }
    }
    
    res.json({
      success: true,
      report: {
        user: {
          name: user.name,
          email: user.email,
          preferedCurrency: user.preferedCurrency
        },
        period: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
          type: period
        },
        totalExpenses,
        categoryBreakdown,
        trend
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;