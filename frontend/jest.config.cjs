module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.setup.cjs'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { configFile: '../.babelrc' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/jest-image-mock.cjs',
  },
  testMatch: ['<rootDir>/tests/**/*.test.{js,jsx}'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.jsx',
    '!src/**/*.d.ts',
  ],
  coverageReporters: ['text', 'json', 'html', 'lcov'],
  coverageDirectory: '<rootDir>/coverage',
};
