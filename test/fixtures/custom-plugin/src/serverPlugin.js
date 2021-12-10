const { createServerPlugin } = require('@shuvi/service');

module.exports = option =>
  createServerPlugin({
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
    },
    serverListen: () => {
      console.warn('serverListen');
    },
    render: (renderAppToString, appContext) => {
      if (appContext.forbidden) {
        return '403 Custom HTML by custom render';
      }
      return renderAppToString();
    },
    onViewDone: ({ res, html, appContext }) => {
      if (appContext.forbidden) {
        res.statusCode = 403;
        res.end(html);
      }
    }
  });
