import { defineRule } from '../utils/define-rule';
import { THRESHOLD, minDistance } from '../utils/url';

const EXPORT_FUNCTIONS = ['loader'];
const PAGEREG = /routes\/.*page\.(j|t)sx?$/;

export default defineRule({
  meta: {
    docs: {
      description: 'Prevent common typos in Shuvi.js data fetching functions.',
      recommended: true
    },
    type: 'problem',
    schema: []
  },

  create(context) {
    function checkTypos(node, name) {
      if (EXPORT_FUNCTIONS.includes(name)) {
        return;
      }

      const potentialTypos = EXPORT_FUNCTIONS.map(o => ({
        option: o,
        distance: minDistance(o, name)
      }))
        .filter(({ distance }) => distance <= THRESHOLD && distance > 0)
        .sort((a, b) => a.distance - b.distance);

      if (potentialTypos.length) {
        context.report({
          node,
          message: `${name} may be a typo. Did you mean ${potentialTypos[0].option}?`
        });
      }
    }
    return {
      ExportNamedDeclaration(node) {
        const fileName = context.getFilename();
        if (!fileName || !PAGEREG.test(fileName)) {
          return;
        }

        const decl = node.declaration;

        if (!decl) {
          return;
        }

        switch (decl.type) {
          case 'FunctionDeclaration': {
            checkTypos(node, decl.id?.name);
            break;
          }
          case 'VariableDeclaration': {
            decl.declarations.forEach(d => {
              if (d.id.type !== 'Identifier') {
                return;
              }
              checkTypos(node, d.id.name);
            });
            break;
          }
          default: {
            break;
          }
        }
        return;
      }
    };
  }
});
