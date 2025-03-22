
// import request from 'supertest';
// import app from '../../index.js';
// import { connectTestDB, disconnectTestDB } from '../testdb.js';

// beforeAll(async () => {
//   await connectTestDB();
// });

// afterAll(async () => {
//   await disconnectTestDB();
// });

// describe('Goal Routes', () => {
//   let createdGoalId;

//   test('should create a new goal', async () => {
//     const res = await request(app).post('/api/goals').send({
//       name: 'Save for Vacation',
//       targetAmount: 5000,
//       currentAmount: 1000,
//       deadline: '2025-12-31'
//     });

//     expect(res.statusCode).toBe(201);
//     expect(res.body).toHaveProperty('_id');
//     createdGoalId = res.body._id;
//   });

//   test('should get all goals', async () => {
//     const res = await request(app).get('/api/goals');

//     expect(res.statusCode).toBe(200);
//     expect(Array.isArray(res.body)).toBe(true);
//   });

//   test('should get a goal by ID', async () => {
//     const res = await request(app).get(`/api/goals/${createdGoalId}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('_id', createdGoalId);
//   });

//   test('should update a goal', async () => {
//     const res = await request(app).put(`/api/goals/${createdGoalId}`).send({
//       name: 'Save for Europe Trip',
//       targetAmount: 6000
//     });

//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('name', 'Save for Europe Trip');
//   });

//   test('should update goal progress', async () => {
//     const res = await request(app).patch(`/api/goals/${createdGoalId}/progress`).send({
//       currentAmount: 2500
//     });

//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('currentAmount', 2500);
//   });

//   test('should delete a goal', async () => {
//     const res = await request(app).delete(`/api/goals/${createdGoalId}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('message', 'Goal deleted successfully!');
//   });
// });
