module.exports = {
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/backend/tests/config/*.test.js',
        '<rootDir>/backend/tests/controllers/*.test.js',
        '<rootDir>/backend/tests/helpers/*.test.js',
        '<rootDir>/backend/tests/middleware/*.test.js',
        '<rootDir>/backend/tests/models/*.test.js',
        '<rootDir>/backend/tests/routes/*.test.js',
      ],
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
      collectCoverageFrom: [
        'backend/**/*.js',
        '!backend/tests/**',
        '!backend/node_modules/**',
      ],
      coveragePathIgnorePatterns: ['/node_modules/'],
    },
    {
      displayName: 'integration',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/backend/tests/integration/**/*.test.js'],
      maxWorkers: 1,
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
      collectCoverageFrom: [
        'backend/**/*.js',
        '!backend/tests/**',
        '!backend/node_modules/**',
      ],
      coveragePathIgnorePatterns: ['/node_modules/'],
    },
  ],
  coverageReporters: ['text', 'json', 'html', 'lcov'],
  collectCoverageFrom: [
    'backend/**/*.js',
    '!node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
  ],
};
