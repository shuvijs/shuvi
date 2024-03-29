import { defineRule } from '../utils/define-rule';

export const url =
  'https://shuvijs.github.io/shuvijs.org/docs/guides/rules/no-html-link-for-pages';

export default defineRule({
  meta: {
    docs: {
      description: 'Prevent usage of `<head>` element.',
      category: 'HTML',
      recommended: true,
      url
    },
    type: 'problem',
    schema: []
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const filePath = context.getFilename();

        if (filePath && filePath.endsWith('document.ejs')) {
          return;
        }
        // Only lint the <head> element in pages directory
        if (node.name.name !== 'head') {
          return;
        }

        context.report({
          node,
          message: `Do not use \`<head>\` element. Use \`<Head />\` from \`shuvi/runtime\` instead. See: ${url}`
        });
      }
    };
  }
});
