import { defineRule } from '../utils/define-rule';
import { isPage } from '../utils/is-page';

const WHITELIST = ['loader', 'default'];

export default defineRule({
  meta: {
    docs: {
      description: `Prohibit exporting ${WHITELIST.join(
        ','
      )} module from a single module, please export separately from different modules.`,
      recommended: true
    },
    type: 'problem',
    schema: []
  },

  create(context) {
    const exported = {};
    const nodes = new Set();
    return {
      ExportNamedDeclaration(node) {
        const fileName = context.getFilename();
        if (!fileName || !isPage(fileName)) {
          return;
        }
        if (!node.source) {
          return;
        }
        if (!node.specifiers || node.specifiers.length === 0) {
          return;
        }
        const sourceValue = node.source.value;
        node.specifiers.forEach(specifier => {
          const name = specifier.exported.name;
          if (WHITELIST.includes(name)) {
            if (exported[name]) {
              context.report({
                node,
                message: `${name} duplicate export from ${sourceValue}`
              });
            }
            exported[name] = sourceValue;
            nodes.add(node);
          }
        });
      },

      'Program:exit': function onExit() {
        const sourceValues = Object.values(exported);
        const length = sourceValues.length;
        if (!length) {
          return;
        }
        if (new Set(sourceValues).size !== length) {
          nodes.forEach(node => {
            context.report({
              node,
              message: `Prohibit exporting ${WHITELIST.join(
                ', '
              )} module from a single module, please export separately from different modules. https://shuvijs.github.io/shuvijs.org/docs/guides/Data%20Fetching#import-loader-from-other-modules`
            });
          });
        }
      }
    };
  }
});
