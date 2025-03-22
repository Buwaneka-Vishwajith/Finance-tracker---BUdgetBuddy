import User from '../Models/user.js';
import Transaction from '../Models/Transaction.js';
import Budget from '../Models/Budget.js';
import Goal from '../Models/Goal.js';
import { 
  sendUnusualSpendingAlert, 
  sendBillPaymentReminder, 
  sendGoalDeadlineReminder, 
  sendBudgetThresholdAlert 
} from '../Utils/mailer.js';

// Check for unusual spending patterns
export const checkUnusualSpending = async (userId, newTransaction) => {
  try {
   
    if (newTransaction.type === 'income') return;

    const user = await User.findById(userId);
    if (!user || !user.settings.notificationsEnabled) return;

    
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const transactions = await Transaction.find({
      user: userId,
      category: newTransaction.category,
      type: 'expense',
      date: { $gte: threeMonthsAgo },
      _id: { $ne: newTransaction._id } // Exclude the current transaction
    });

    // Calculate average spending in this category
    if (transactions.length >= 3) { 
      const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
      const avgSpent = totalSpent / transactions.length;
      
      // If current transaction is 50% more than average, send alert
      if (newTransaction.amount > avgSpent * 1.5) {
        await sendUnusualSpendingAlert(user, newTransaction.category, newTransaction.amount, newTransaction.currency);
      }
    }
  } catch (error) {
    console.error('Error checking unusual spending:', error);
  }
};

// Check for upcoming bill payments (recurring expenses)
export const checkBillPayments = async () => {
  try {
    const today = new Date();
    const oneWeekFromNow = new Date(today);
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    
    // Find all recurring transactions
    const recurringTransactions = await Transaction.find({
      isRecurring: true,
      type: 'expense'
    }).populate('user');
    
    for (const transaction of recurringTransactions) {
      if (!transaction.user || !transaction.user.settings.notificationsEnabled) continue;
      
      // Calculate next due date based on frequency
      let nextDueDate = new Date(transaction.date);
      
      switch (transaction.recurringDetails.frequency) {
        case 'daily':
          // Find the next occurrence from today
          while (nextDueDate < today) {
            nextDueDate.setDate(nextDueDate.getDate() + 1);
          }
          break;
        case 'weekly':
          // Find the next occurrence from today
          while (nextDueDate < today) {
            nextDueDate.setDate(nextDueDate.getDate() + 7);
          }
          break;
        case 'monthly':
          // Find the next occurrence from today
          while (nextDueDate < today) {
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          }
          break;
        case 'yearly':
          // Find the next occurrence from today
          while (nextDueDate < today) {
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
          }
          break;
      }
      
      // If the next due date is within the next week, send a reminder
      if (nextDueDate <= oneWeekFromNow) {
        await sendBillPaymentReminder(
          transaction.user, 
          transaction.description, 
          transaction.amount, 
          transaction.currency, 
          nextDueDate
        );
      }
    }
  } catch (error) {
    console.error('Error checking bill payments:', error);
  }
};

// Check for upcoming goal deadlines
export const checkGoalDeadlines = async () => {
  try {
    const today = new Date();
    const oneWeekFromNow = new Date(today);
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    
    // Find goals that are approaching their deadline
    const goals = await Goal.find({
      deadline: { $gte: today, $lte: oneWeekFromNow },
      currentAmount: { $lt: '$targetAmount' } // Only alert if goal is not yet met
    }).populate('user');
    
    for (const goal of goals) {
      if (!goal.user || !goal.user.settings.notificationsEnabled) continue;
      
      // Send deadline reminder
      await sendGoalDeadlineReminder(goal.user, goal);
    }
  } catch (error) {
    console.error('Error checking goal deadlines:', error);
  }
};

// Check for budget thresholds
export const checkBudgetThresholds = async (userId, newTransaction) => {
  try {
    // Skip if it's an income transaction
    if (newTransaction.type === 'income') return;

    const user = await User.findById(userId);
    if (!user || !user.settings.budgetAlerts === false) return;
    
    // Find the budget for this category
    const budget = await Budget.findOne({
      user: userId,
      category: newTransaction.category
    });
    
    if (!budget || !budget.notifications.enabled) return;
    
    // Get the first day of the current period
    const today = new Date();
    let periodStart = new Date(today.getFullYear(), today.getMonth(), 1); // First day of month
    
    if (budget.period === 'yearly') {
      periodStart = new Date(today.getFullYear(), 0, 1); // First day of year
    }
    
    // Calculate total spent in this category during this period
    const transactions = await Transaction.find({
      user: userId,
      category: newTransaction.category,
      type: 'expense',
      date: { $gte: periodStart }
    });
    
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const percentageUsed = (totalSpent / budget.amount) * 100;
    
  
    if (percentageUsed >= budget.notifications.threshold) {
      await sendBudgetThresholdAlert(user, budget, totalSpent, percentageUsed.toFixed(1));
    }
  } catch (error) {
    console.error('Error checking budget thresholds:', error);
  }
};