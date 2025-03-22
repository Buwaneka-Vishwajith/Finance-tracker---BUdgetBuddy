
// import request from 'supertest';
// import app from '../../index.js';
// import { connectTestDB, disconnectTestDB } from '../testdb.js';

// beforeAll(async () => {
//   await connectTestDB(); // Ensure mock DB is used
// });

// afterAll(async () => {
//   await disconnectTestDB(); // Clean up mock DB
// });

// describe('Budget Routes', () => {
//   let createdBudgetId;

//   test('should create a budget', async () => {
//     const res = await request(app).post('/api/budgets').send({
//       name: 'Test Budget',
//       amount: 5000,
//       type: 'Monthly'
//     });

//     expect(res.statusCode).toBe(201);
//     expect(res.body).toHaveProperty('_id');
//     createdBudgetId = res.body._id; // Save the ID for further tests
//   });

//   test('should get all budgets', async () => {
//     const res = await request(app).get('/api/budgets');

//     expect(res.statusCode).toBe(200);
//     expect(Array.isArray(res.body)).toBe(true);
//   });

//   test('should get a specific budget by id', async () => {
//     const res = await request(app).get(`/api/budgets/${createdBudgetId}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('_id', createdBudgetId);
//   });

//   test('should update a budget', async () => {
//     const res = await request(app).put(`/api/budgets/${createdBudgetId}`).send({
//       name: 'Updated Budget',
//       amount: 6000
//     });

//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('name', 'Updated Budget');
//     expect(res.body).toHaveProperty('amount', 6000);
//   });

//   test('should delete a budget', async () => {
//     const res = await request(app).delete(`/api/budgets/${createdBudgetId}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('message', 'Budget deleted successfully');
//   });
// });
