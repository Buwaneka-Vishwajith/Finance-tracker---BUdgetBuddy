
// import request from 'supertest';
// import app from '../../index.js';
// import { connectTestDB, disconnectTestDB } from '../testdb.js';

// beforeAll(async () => {
//   await connectTestDB(); // Ensure mock DB is used
// });

// afterAll(async () => {
//   await disconnectTestDB(); // Clean up mock DB
// });

// describe('Account Routes', () => {
//   let createdAccountId;

//   test('should create an account', async () => {
//     const res = await request(app).post('/api/accounts').send({
//       name: 'Test Account',
//       type: 'Savings',
//       balance: 1000,
//       currency: 'USD'
//     });

//     expect(res.statusCode).toBe(201);
//     expect(res.body).toHaveProperty('_id');
//     createdAccountId = res.body._id; // Save the ID for further tests
//   });

//   test('should get all accounts', async () => {
//     const res = await request(app).get('/api/accounts');

//     expect(res.statusCode).toBe(200);
//     expect(Array.isArray(res.body)).toBe(true);
//   });

//   test('should update an account', async () => {
//     const res = await request(app).put(`/api/accounts/${createdAccountId}`).send({
//       name: 'Updated Account',
//       balance: 2000,
//       currency: 'USD'
//     });

//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('name', 'Updated Account');
//     expect(res.body).toHaveProperty('balance', 2000);
//   });

//   test('should delete an account', async () => {
//     const res = await request(app).delete(`/api/accounts/${createdAccountId}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('message', 'Account deleted successfully');
//   });
// });
