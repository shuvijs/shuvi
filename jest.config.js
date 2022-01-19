// jest.config.js
module.exports = {
  verbose: true,

  forceExit: false,

  bail: false,

  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
        allowJs: true,
        target: 'es6',
        lib: ['esnext'],
        module: 'commonjs',
        moduleResolution: 'node',
        skipLibCheck: true,
        esModuleInterop: true,
        noUnusedLocals: false
      }
    }
  },

  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],

  globalTeardown: '<rootDir>/test/teardown.ts',

  testEnvironment: 'node',

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  preset: 'ts-jest/presets/js-with-ts',

  roots: ['<rootDir>/packages', '<rootDir>/test'],

  watchPathIgnorePatterns: ['/fixtures'],

  testMatch: [
    '<rootDir>/test/**/*.test.[jt]s?(x)',
    '**/__tests__/**/*.test.[jt]s?(x)'
  ],

  moduleNameMapper: {
    '^shuvi-test-utils(/?.*)$': '<rootDir>/test/utils/$1',
    // https://github.com/ilearnio/module-alias#usage-with-jest
    // just for on-demand-compile test
    "@shuvi/service/resources": "<rootDir>/test/fixtures/on-demand-compile/.shuvi/resources"
  }
};
