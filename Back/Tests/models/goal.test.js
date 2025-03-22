import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Goal from '../../Models/Goal.js';

describe('Goal Model Test', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should create a goal', async () => {
    const goal = new Goal({
      user: new mongoose.Types.ObjectId(),
      title: 'New Car',
      targetAmount: 20000,
      currentAmount: 5000,
      currency: 'USD',
      deadline: new Date(Date.now() + 1000000000)
    });
    
    const savedGoal = await goal.save();
    expect(savedGoal._id).toBeDefined();
    expect(savedGoal.title).toBe('New Car');
  });
});