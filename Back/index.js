import express from 'express';
import connectDB from './Config/db.js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './Routes/auth.js';
import transactionRoutes from './Routes/transactions.js';
import budgetRoutes from './Routes/budgets.js';
import goalRoutes from './Routes/goals.js';
import accountRoutes from './Routes/accounts.js';
import { startScheduler } from './Services/scheduler.js';
import reportsRoutes from './Routes/reportRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  res.send("Finance API is running!")
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/reports', reportsRoutes);

//schedular
startScheduler();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
});

export default app; 