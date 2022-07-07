const { createServerPlugin } = require('@shuvi/service');

module.exports = option =>
  createServerPlugin({
    pageData: () => {
      return {
        foo: 'bar' + option.world
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
    handlePageRequest: originalHandlePageRequest => {
      return async (req, res) => {
        await originalHandlePageRequest(req, res);
        console.log('test-handle-page-request');
      };
    },
    onListen: () => {
      console.warn('onListen');
    }
  });
