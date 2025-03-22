import { checkBillPayments, checkGoalDeadlines } from './notificationService.js';


export const startScheduler = () => {

  const runDailyChecks = async () => {
    console.log('Running scheduled notification checks...');
    await checkBillPayments();
    await checkGoalDeadlines();
  };


  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const timeUntilMidnight = midnight - now;


  setTimeout(() => {
    runDailyChecks();

    setInterval(runDailyChecks, 24 * 60 * 60 * 1000);
  }, timeUntilMidnight);

 
  if (process.env.NODE_ENV === 'development') {
    runDailyChecks();
  }
};