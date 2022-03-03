// jest.config.js
module.exports = {
  verbose: true,

  forceExit: false,

  bail: false,

  globals: {
    'ts-jest': {
      packageJson: 'package.json',
      tsConfig: {
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

  setupFilesAfterEnv: ['<rootDir>/setup.ts'],

  globalTeardown: '<rootDir>/teardown.ts',

  testEnvironment: 'node',

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  preset: 'ts-jest/presets/js-with-ts',

  roots: ['<rootDir>'],

  watchPathIgnorePatterns: ['/fixtures'],

  testMatch: ['<rootDir>/**/*.test.[jt]s?(x)']
};
