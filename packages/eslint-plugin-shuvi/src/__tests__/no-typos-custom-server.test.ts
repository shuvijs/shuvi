import rule from '../rules/no-typos-custom-server';
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

ruleTester.run('no-typos-custom-server', rule, {
  valid: [
    `
      export const getPageData = () => {};
    `,
    `
      export const handlePageRequest = () => {};
    `,
    `
      export const modifyHtml = () => {};
    `,
    `
      export const sendHtml = () => {};
    `,
    `
      export const getPageData = () => {};
      export const handlePageRequest = () => {};
      export const modifyHtml = () => {};
      export const sendHtml = () => {};
    `,
    {
      code: `
        export const getPageDatas = () => {};
        export const handlePageRequests = () => {};
        export const modifyHtmls = () => {};
        export const sendHtmls = () => {};
      `,
      filename: 'src/otherServer.js'
    }
  ],
  invalid: [
    {
      code: `
        export const getPageDatas = () => {};
      `,
      filename: 'src/server.js',
      errors: [
        {
          message: 'getPageDatas may be a typo. Did you mean getPageData?',
          type: 'ExportNamedDeclaration'
        }
      ]
    },
    {
      code: `
        export const handlePageRequests = () => {};
      `,
      filename: 'src/server.js',
      errors: [
        {
          message:
            'handlePageRequests may be a typo. Did you mean handlePageRequest?',
          type: 'ExportNamedDeclaration'
        }
      ]
    },
    {
      code: `
        export const modifyHtmls = () => {};
      `,
      filename: 'src/server.js',
      errors: [
        {
          message: 'modifyHtmls may be a typo. Did you mean modifyHtml?',
          type: 'ExportNamedDeclaration'
        }
      ]
    },
    {
      code: `
        export const sendHtmls = () => {};
      `,
      filename: 'src/server.js',
      errors: [
        {
          message: 'sendHtmls may be a typo. Did you mean sendHtml?',
          type: 'ExportNamedDeclaration'
        }
      ]
    },
    {
      code: `
        export const getPageDatas = () => {};
        export const handlePageRequests = () => {};
        export const modifyHtmls = () => {};
        export const sendHtmls = () => {};
      `,
      filename: 'src/server.ts',
      errors: [
        {
          message: 'getPageDatas may be a typo. Did you mean getPageData?',
          type: 'ExportNamedDeclaration'
        },
        {
          message:
            'handlePageRequests may be a typo. Did you mean handlePageRequest?',
          type: 'ExportNamedDeclaration'
        },
        {
          message: 'modifyHtmls may be a typo. Did you mean modifyHtml?',
          type: 'ExportNamedDeclaration'
        },
        {
          message: 'sendHtmls may be a typo. Did you mean sendHtml?',
          type: 'ExportNamedDeclaration'
        }
      ]
    }
  ]
});
