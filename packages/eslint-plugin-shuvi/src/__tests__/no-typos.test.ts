import rule from '../rules/no-typos';
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

ruleTester.run('no-typos', rule, {
  valid: [
    `
      export default function Page() {
        return <div></div>;
      }
      export const loader = async () => {};
    `,
    `
      export default function Page() {
        return <div></div>;
      }
      export async function Loader() {};
    `,
    // detect only typo that is one operation away from the correct one
    `
      export default function Page() {
        return <div></div>;
      }
      export async function loaderss() {};
    `,
    {
      code: `
        export default function Page() {
          return <div></div>;
        }
        export const loaders = async () => {};
      `,
      filename: 'src/routes/component.js'
    },
    `
      export default function Page() {
        return <div></div>;
      }
      export async function Loaderss() {};
    `
  ],
  invalid: [
    {
      code: `
        export default function Page() {
          return <div></div>;
        }
        export const loaders = async () => {};
      `,
      filename: 'src/routes/page.js',
      errors: [
        {
          message: 'loaders may be a typo. Did you mean loader?',
          type: 'ExportNamedDeclaration'
        }
      ]
    },
    {
      code: `
        export default function Page() {
          return <div></div>;
        }
        export const loaders = async () => {};
      `,
      filename: 'src/routes/xx/page.tsx',
      errors: [
        {
          message: 'loaders may be a typo. Did you mean loader?',
          type: 'ExportNamedDeclaration'
        }
      ]
    }
  ]
});
