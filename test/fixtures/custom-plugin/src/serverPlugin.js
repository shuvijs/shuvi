const { createPlugin } = require('@shuvi/platform-web/lib/serverHooks');

module.exports = option =>
  createPlugin({
    pageData: () => {
      return {
        foo: 'bar' + option
      };
    },
    modifyHtml: documentProps => {
      documentProps.headTags.push({
        tagName: 'meta',
        attrs: {
          name: 'testDocumentProps'
        }
      });
      return documentProps;
    },
    renderToHTML: renderToHTML => {
      return async (req, res) => {
        const html = await renderToHTML(req, res);
        console.log('custom-renderToHTML', html);
        return html;
      };
    }
  });
