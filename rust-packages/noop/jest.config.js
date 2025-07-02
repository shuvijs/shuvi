module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__test__/**/*.test.ts'],
  testPathIgnorePatterns: ['/__test__/fixtures/'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../../tsconfig.json' }]
  }
};
