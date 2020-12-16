module.exports = {
  ssr: true,
  plugins: [
    api => {
      api.tap('modifyHtml', {
        name: 'test-document-props',
        fn(documentProps) {
          documentProps.headTags.push({
            tagName: 'meta',
            attrs: {
              name: 'testDocumentProps'
            }
          });
          return documentProps;
        }
      });
    },
    api => {
      api.tap('renderToHTML', {
        name: 'custom-renderToHTML',
        fn(renderToHTML) {
          return async (req, res) => {
            const html = await renderToHTML(req, res);
            console.log('custom-renderToHTML', html);
            return html;
          };
        }
      });
    }
  ]
};
