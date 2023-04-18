import { defineRule } from '../utils/define-rule';

const EXPORT_FUNCTIONS = ['loader'];
const PAGEREG = /routes\/.*page\.(j|t)sx?$/;
// 0 is the exact match
const THRESHOLD = 1;

// the minimum number of operations required to convert string a to string b.
function minDistance(a, b) {
  const m = a.length;
  const n = b.length;

  if (m < n) {
    return minDistance(b, a);
  }

  if (n === 0) {
    return m;
  }

  let previousRow = Array.from({ length: n + 1 }, (_, i) => i);

  for (let i = 0; i < m; i++) {
    const s1 = a[i];
    let currentRow = [i + 1];
    for (let j = 0; j < n; j++) {
      const s2 = b[j];
      const insertions = previousRow[j + 1] + 1;
      const deletions = currentRow[j] + 1;
      const substitutions = previousRow[j] + Number(s1 !== s2);
      currentRow.push(Math.min(insertions, deletions, substitutions));
    }
    previousRow = currentRow;
  }
  return previousRow[previousRow.length - 1];
}

/* eslint-disable eslint-plugin/require-meta-docs-url */
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
