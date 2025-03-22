// import request from 'supertest';
// import app from '../../index.js'; // No need to change this
// import { connectTestDB, disconnectTestDB } from '../testdb.js';

// beforeAll(async () => {
//   await connectTestDB(); // Ensures we use the mock database
// });

// afterAll(async () => {
//   await disconnectTestDB(); // Cleans up the mock database
// });

// describe('User Routes', () => {
//   test('should create a user', async () => {
//     const res = await request(app).post('/api/users').send({
//       name: 'Test User',
//       email: 'test@example.com',
//       password: 'password123',
//     });

//     expect(res.statusCode).toBe(201);
//     expect(res.body).toHaveProperty('token');
//   });
// });
