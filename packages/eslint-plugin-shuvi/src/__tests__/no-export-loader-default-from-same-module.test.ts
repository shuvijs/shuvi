import rule from '../rules/no-export-loader-default-from-same-module';
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

ruleTester.run('no-export-loader-default-from-same-module', rule, {
  valid: [
    {
      code: `
      import React from 'react';
      import { useLoaderData } from '@shuvi/runtime';

      function One(){
        const data = useLoaderData();
        return <div>{data.time}</div>;
      };


      export const loader = async ({ query }) => {
        return {
          time: 1
        };
      };

      export default One;
      `,
      filename: 'src/routes/page.jsx'
    },
    {
      code: `
        export { default } from './xx';
        export { loader } from './other';
      `,
      filename: 'src/routes/page.js'
    },
    {
      code: `
        export { default, loader } from './xx';
      `,
      filename: 'src/app.js'
    }
  ],
  invalid: [
    {
      code: `
      export { default, loader } from './anyModule';
    `,
      filename: 'src/routes/page.js',
      errors: [
        {
          message:
            'Prohibit exporting loader, default module from a single module, please export separately from different modules. https://shuvijs.github.io/shuvijs.org/docs/guides/Data%20Fetching#import-loader-from-other-modules'
        }
      ]
    },
    {
      code: `
      export { any as default, loader } from './anyModule';
    `,
      filename: 'src/routes/page.js',
      errors: [
        {
          message:
            'Prohibit exporting loader, default module from a single module, please export separately from different modules. https://shuvijs.github.io/shuvijs.org/docs/guides/Data%20Fetching#import-loader-from-other-modules'
        }
      ]
    },
    {
      code: `
      export { any as default, anyOther as loader } from './anyModule';
    `,
      filename: 'src/routes/page.js',
      errors: [
        {
          message:
            'Prohibit exporting loader, default module from a single module, please export separately from different modules. https://shuvijs.github.io/shuvijs.org/docs/guides/Data%20Fetching#import-loader-from-other-modules'
        }
      ]
    },
    {
      code: `
      export { loader } from './anyModule';
      export { default } from './anyModule';
    `,
      filename: 'src/routes/page.js',
      errors: [
        {
          message:
            'Prohibit exporting loader, default module from a single module, please export separately from different modules. https://shuvijs.github.io/shuvijs.org/docs/guides/Data%20Fetching#import-loader-from-other-modules'
        },
        {
          message:
            'Prohibit exporting loader, default module from a single module, please export separately from different modules. https://shuvijs.github.io/shuvijs.org/docs/guides/Data%20Fetching#import-loader-from-other-modules'
        }
      ]
    }
  ]
});
