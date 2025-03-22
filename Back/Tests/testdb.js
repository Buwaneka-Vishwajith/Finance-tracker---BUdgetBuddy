// import mongoose from 'mongoose';
// import { MongoMemoryServer } from 'mongodb-memory-server';

// let mongoServer;

// export const connectTestDB = async () => {
//   mongoServer = await MongoMemoryServer.create();
//   const mongoUri = mongoServer.getUri();

//   // Close existing connection if any
//   if (mongoose.connection.readyState !== 0) {
//     await mongoose.disconnect();
//   }

//   await mongoose.connect(mongoUri);
// };

// export const disconnectTestDB = async () => {
//   await mongoose.connection.dropDatabase();
//   await mongoose.connection.close();
//   await mongoServer.stop();
// };
