module.exports = {
  projects: [
    {
      displayName: 'backend',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/backend/tests/**/*.test.js'],
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
