/** @type {import('ts-jest').InitialOptionsTsJest} */
module.exports = {
  verbose: true,

  forceExit: true,

  bail: false,

  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
        allowJs: true,
        target: 'es6',
        lib: ['esnext'],
        module: 'commonjs',
        moduleResolution: 'nodenext',
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
    '^@shuvi/plugins/model$': '@shuvi/plugins/lib/model',
    '^@shuvi/plugins/model/(.*)': '@shuvi/plugins/lib/model/$1'
  }
};
