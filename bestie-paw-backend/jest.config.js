/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).ts'],
  setupFiles: ['<rootDir>/tests/setupEnv.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  globalSetup: '<rootDir>/tests/globalSetup.ts',
  collectCoverageFrom: [
    'src/modules/auth/**/*.ts',
    'src/modules/pets/**/*.ts',
    'src/modules/health/**/*.ts',
    'src/modules/articles/**/*.ts',
    'src/modules/users/**/*.ts',
    'src/modules/weight/**/*.ts',
    'src/modules/reminders/**/*.ts',
    'src/modules/stats/**/*.ts',
    '!src/modules/**/index.ts',
    '!src/modules/**/oauth.strategy.ts',
    '!src/modules/**/oauth.service.ts'
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70
    }
  }
};
