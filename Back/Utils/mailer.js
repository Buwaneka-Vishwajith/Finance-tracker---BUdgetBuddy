import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();


const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});


export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};


export const sendUnusualSpendingAlert = async (user, category, amount, currency) => {
  const subject = 'Unusual Spending Alert';
  const html = `
    <h2>Unusual Spending Detected</h2>
    <p>Hello ${user.name},</p>
    <p>We've detected an unusual spending pattern in your account:</p>
    <ul>
      <li>Category: ${category}</li>
      <li>Amount: ${amount} ${currency}</li>
    </ul>
    <p>This spending is significantly higher than your usual pattern for this category.</p>
    <p>If this was not you, please review your account and contact support immediately.</p>
    <p>Best regards,<br>BudgetBuddy</p>
  `;
  
  return await sendEmail(user.email, subject, html);
};


export const sendBillPaymentReminder = async (user, description, amount, currency, dueDate) => {
  const subject = 'Bill Payment Reminder';
  const html = `
    <h2>Upcoming Bill Payment Reminder</h2>
    <p>Hello ${user.name},</p>
    <p>This is a reminder that you have an upcoming payment due:</p>
    <ul>
      <li>Description: ${description}</li>
      <li>Amount: ${amount} ${currency}</li>
      <li>Due Date: ${new Date(dueDate).toLocaleDateString()}</li>
    </ul>
    <p>Please ensure you have sufficient funds available.</p>
    <p>Best regards,<br>BudgetBuddy</p>
  `;
  
  return await sendEmail(user.email, subject, html);
};


export const sendGoalDeadlineReminder = async (user, goal) => {
  const subject = 'Financial Goal Deadline Approaching';
  const progressPercentage = (goal.currentAmount / goal.targetAmount * 100).toFixed(2);
  const remainingAmount = goal.targetAmount - goal.currentAmount;
  
  const html = `
    <h2>Financial Goal Deadline Approaching</h2>
    <p>Hello ${user.name},</p>
    <p>Your financial goal "${goal.title}" is approaching its deadline:</p>
    <ul>
      <li>Current Progress: ${goal.currentAmount} ${goal.currency} (${progressPercentage}%)</li>
      <li>Target Amount: ${goal.targetAmount} ${goal.currency}</li>
      <li>Remaining: ${remainingAmount} ${goal.currency}</li>
      <li>Deadline: ${new Date(goal.deadline).toLocaleDateString()}</li>
    </ul>
    <p>Keep up the good work! You're making progress towards your financial goals.</p>
    <p>Best regards,<br>BudgetBuddy</p>
  `;
  
  return await sendEmail(user.email, subject, html);
};


export const sendBudgetThresholdAlert = async (user, budget, spentAmount, percentageUsed) => {
  const subject = 'Budget Threshold Alert';
  const html = `
    <h2>Budget Threshold Alert</h2>
    <p>Hello ${user.name},</p>
    <p>You've reached ${percentageUsed}% of your budget for ${budget.category}:</p>
    <ul>
      <li>Budget: ${budget.amount} ${budget.currency}</li>
      <li>Spent: ${spentAmount} ${budget.currency}</li>
      <li>Remaining: ${budget.amount - spentAmount} ${budget.currency}</li>
      <li>Period: ${budget.period}</li>
    </ul>
    <p>Consider adjusting your spending in this category to stay within your budget.</p>
    <p>Best regards,<br>BudgetBuddy</p>
  `;
  
  return await sendEmail(user.email, subject, html);
};