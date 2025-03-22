import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Transaction from '../../Models/Transaction.js';

describe('Transaction Model Test', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should create a transaction', async () => {
    const transaction = new Transaction({
      user: new mongoose.Types.ObjectId(),
      type: 'income',
      amount: 1500,
      currency: 'USD',
      category: 'Salary'
    });
    
    const savedTransaction = await transaction.save();
    expect(savedTransaction._id).toBeDefined();
    expect(savedTransaction.type).toBe('income');
  });
});