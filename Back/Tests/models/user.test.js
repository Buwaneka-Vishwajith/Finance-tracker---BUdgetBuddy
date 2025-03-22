import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../../Models/user.js';

describe('User Model Test', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should create a user', async () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    });
    
    const savedUser = await user.save();
    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe('john@example.com');
  });
});