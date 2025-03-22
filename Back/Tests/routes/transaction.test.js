
// import request from 'supertest';
// import app from '../../index.js';
// import { connectTestDB, disconnectTestDB } from '../testdb.js';

// beforeAll(async () => {
//   await connectTestDB();
// });

// afterAll(async () => {
//   await disconnectTestDB();
// });

// describe('Transaction Routes', () => {
//   let createdTransactionId;

//   test('should create a new transaction', async () => {
//     const res = await request(app).post('/api/transactions').send({
//       amount: 200,
//       description: 'Grocery Shopping',
//       type: 'Expense'
//     });

//     expect(res.statusCode).toBe(201);
//     expect(res.body).toHaveProperty('_id');
//     createdTransactionId = res.body._id;
//   });

//   test('should get all transactions', async () => {
//     const res = await request(app).get('/api/transactions');

//     expect(res.statusCode).toBe(200);
//     expect(Array.isArray(res.body)).toBe(true);
//   });

//   test('should update a transaction', async () => {
//     const res = await request(app).put(`/api/transactions/${createdTransactionId}`).send({
//       amount: 150,
//       description: 'Grocery Shopping - Discounted',
//     });

//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('description', 'Grocery Shopping - Discounted');
//   });

//   test('should delete a transaction', async () => {
//     const res = await request(app).delete(`/api/transactions/${createdTransactionId}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('message', 'Transaction deleted!');
//   });
// });
