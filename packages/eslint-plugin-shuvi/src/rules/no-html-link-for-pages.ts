import { defineRule } from '../utils/define-rule';
import * as path from 'path';
import * as fs from 'fs';
import { matchRoutes } from '@shuvi/router';

import {
  getUrlFromPagesDirectories,
  normalizeURL,
  execOnce
} from '../utils/url';

const pagesDirWarning = execOnce(pagesDirs => {
  console.warn(
    `Pages directory cannot be found at ${pagesDirs.join(' or ')}. ` +
      'If using a custom path, please configure with the `no-html-link-for-pages` rule in your eslint config file.'
  );
});

// Cache for fs.existsSync lookup.
// Prevent multiple blocking IO requests that have already been calculated.
const fsExistsSyncCache = {};

export default defineRule({
  meta: {
    docs: {
      description:
        'Prevent usage of `<a>` elements to navigate to internal Shuvi.js pages.',
      category: 'HTML',
      recommended: true
    },
    type: 'problem',
    schema: [
      {
        oneOf: [
          {
            type: 'string'
          },
          {
            type: 'array',
            uniqueItems: true,
            items: {
              type: 'string'
            }
          }
        ]
      }
    ]
  },

  /**
   * Creates an ESLint rule listener.
   */
  create(context) {
    const ruleOptions: (string | string[])[] = context.options;
    const [customPagesDirectory] = ruleOptions;

    const rootDirs = [context.getCwd()];

    const pagesDirs = (
      customPagesDirectory
        ? [customPagesDirectory]
        : rootDirs.map(dir => [path.join(dir, 'src', 'routes')])
    ).flat();

    const foundPagesDirs = pagesDirs.filter(dir => {
      if (fsExistsSyncCache[dir] === undefined) {
        fsExistsSyncCache[dir] = fs.existsSync(dir);
      }
      return fsExistsSyncCache[dir];
    });

    // warn if there are no pages directories
    if (foundPagesDirs.length === 0) {
      pagesDirWarning(pagesDirs);
      return {};
    }

    const pageUrls = getUrlFromPagesDirectories('/', foundPagesDirs);
    return {
      JSXOpeningElement(node) {
        if (node.name.name !== 'a') {
          return;
        }

        if (node.attributes.length === 0) {
          return;
        }

        const target = node.attributes.find(
          attr => attr.type === 'JSXAttribute' && attr.name.name === 'target'
        );

        if (target && target.value.value === '_blank') {
          return;
        }

        const href = node.attributes.find(
          attr => attr.type === 'JSXAttribute' && attr.name.name === 'href'
        );

        if (!href || (href.value && href.value.type !== 'Literal')) {
          return;
        }

        const hasDownloadAttr = node.attributes.find(
          attr => attr.type === 'JSXAttribute' && attr.name.name === 'download'
        );

        if (hasDownloadAttr) {
          return;
        }

        const value = href.value.value;
        const hrefPath = normalizeURL(value);
        if (!hrefPath) {
          return;
        }
        // Outgoing links are ignored
        if (/^(https?:\/\/|\/\/)/.test(hrefPath)) {
          return;
        }

        const match = matchRoutes(pageUrls, hrefPath);
        if (match) {
          context.report({
            node,
            message: `Do not use an \`<a>\` element to navigate to \`${hrefPath}\`. Use \`<Link />\` from \`shuvi/runtime\` instead.`
          });
        }
      }
    };
  }
});
