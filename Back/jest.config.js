export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  verbose: true,
  testTimeout: 30000,
  rootDir: './',
  roots: ['<rootDir>/Tests']
};
