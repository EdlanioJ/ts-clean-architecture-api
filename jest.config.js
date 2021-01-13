const path = require('path');
module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
  },
  roots: ['<rootDir>/src'],
  testEnvironment: path.resolve(
    __dirname,
    'prisma',
    'prisma-test-environment.js'
  ),
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  transform: {
    '.+\\.ts$': 'ts-jest',
  },
};
