import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Budget from '../../Models/Budget.js';

describe('Budget Model Test', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should create a budget', async () => {
    const budget = new Budget({
      user: new mongoose.Types.ObjectId(),
      category: 'Food',
      amount: 500,
      currency: 'USD',
      period: 'monthly'
    });
    
    const savedBudget = await budget.save();
    expect(savedBudget._id).toBeDefined();
    expect(savedBudget.category).toBe('Food');
  });
});