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

      api.on('onViewDone', ({ html, req, res, appContext }) =>
        global.testHTML({ req, res, html, appContext })
      );
    }
  ]
};
