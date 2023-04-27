import rule from '../rules/no-typos-custom-app';
import { RuleTester } from 'eslint';
(RuleTester as any).setDefaultConfig({
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      modules: true,
      jsx: true
    }
  }
});

const ruleTester = new RuleTester();

ruleTester.run('no-typos-custom-app', rule, {
  valid: [
    `
      export const init = () => {};
    `,
    `
      export const appContext = () => {};
    `,
    `
      export const appComponent = () => {};
    `,
    `
      export const dispose = () => {};
    `,
    `
      export const init = () => {};
      export const appContext = () => {};
      export const appComponent = () => {};
      export const dispose = () => {};
    `,
    {
      code: `
        export const inits = () => {};
        export const appContexts = () => {};
        export const appComponents = () => {};
        export const disposes = () => {};
      `,
      filename: 'src/otherApp.js'
    }
  ],
  invalid: [
    {
      code: `
        export const inits = () => {};
      `,
      filename: 'src/app.js',
      errors: [
        {
          message: 'inits may be a typo. Did you mean init?',
          type: 'ExportNamedDeclaration'
        }
      ]
    },
    {
      code: `
        export const appContexts = () => {};
      `,
      filename: 'src/app.js',
      errors: [
        {
          message: 'appContexts may be a typo. Did you mean appContext?',
          type: 'ExportNamedDeclaration'
        }
      ]
    },
    {
      code: `
        export const appComponents = () => {};
      `,
      filename: 'src/app.js',
      errors: [
        {
          message: 'appComponents may be a typo. Did you mean appComponent?',
          type: 'ExportNamedDeclaration'
        }
      ]
    },
    {
      code: `
        export const disposes = () => {};
      `,
      filename: 'src/app.js',
      errors: [
        {
          message: 'disposes may be a typo. Did you mean dispose?',
          type: 'ExportNamedDeclaration'
        }
      ]
    },
    {
      code: `
        export const inits = () => {};
        export const appContexts = () => {};
        export const appComponents = () => {};
        export const disposes = () => {};
      `,
      filename: 'src/app.ts',
      errors: [
        {
          message: 'inits may be a typo. Did you mean init?',
          type: 'ExportNamedDeclaration'
        },
        {
          message: 'appContexts may be a typo. Did you mean appContext?',
          type: 'ExportNamedDeclaration'
        },
        {
          message: 'appComponents may be a typo. Did you mean appComponent?',
          type: 'ExportNamedDeclaration'
        },
        {
          message: 'disposes may be a typo. Did you mean dispose?',
          type: 'ExportNamedDeclaration'
        }
      ]
    }
  ]
});
