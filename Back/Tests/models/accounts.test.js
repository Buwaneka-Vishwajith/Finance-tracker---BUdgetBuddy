import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Account from '../../Models/accounts.js';  // Adjust this path to match your project structure

describe('Account Model Test', () => {
  let mongoServer;
  
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });
  
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  
  afterEach(async () => {
    // Clean up after each test
    await Account.deleteMany({});
  });
  
  it('should create an account', async () => {
    const userId = new mongoose.Types.ObjectId();
    const account = new Account({
      user: userId,
      name: 'Savings Account',
      type: 'bank',
      balance: 1000,
      currency: 'USD'
    });
    
    const savedAccount = await account.save();
    expect(savedAccount._id).toBeDefined();
    expect(savedAccount.name).toBe('Savings Account');
    expect(savedAccount.balanceHistory.length).toBe(1); // Should have initial balance entry
  });
  
  it('should validate currency code format', async () => {
    const accountWithInvalidCurrency = new Account({
      user: new mongoose.Types.ObjectId(),
      name: 'Invalid Currency Account',
      type: 'bank',
      balance: 500,
      currency: 'INVALID' // Invalid currency code (not 3 uppercase letters)
    });
    
    await expect(accountWithInvalidCurrency.save()).rejects.toThrow();
  });
  
  it('should update balanceHistory when balance changes', async () => {
    // Create initial account
    const account = new Account({
      user: new mongoose.Types.ObjectId(),
      name: 'Balance History Test',
      type: 'bank',
      balance: 100,
      currency: 'EUR'
    });
    
    const savedAccount = await account.save();
    expect(savedAccount.balanceHistory.length).toBe(1);
    
    // Update the balance
    savedAccount.balance = 200;
    await savedAccount.save();
    
    // Reload from DB to verify
    const updatedAccount = await Account.findById(savedAccount._id);
    expect(updatedAccount.balanceHistory.length).toBe(2);
    expect(updatedAccount.balanceHistory[1].amount).toBe(200);
    expect(updatedAccount.balanceHistory[1].currency).toBe('EUR');
  });
});