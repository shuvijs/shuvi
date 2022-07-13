const { createServerPlugin } = require('shuvi');

module.exports = option =>
  createServerPlugin({
    getPageData: () => {
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
    listen: () => {
      console.warn('onListen');
    }
  });
