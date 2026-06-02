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
    '!src/modules/**/index.ts',
    '!src/modules/**/oauth.strategy.ts',
    '!src/modules/**/oauth.service.ts'
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 44,
      functions: 66,
      lines: 70
    }
  }
};
