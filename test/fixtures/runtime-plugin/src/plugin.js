export default ({ registerPlugin }) => {
  registerPlugin('server:getPageData', {
    name: 'test',
    fn() {
      return {
        foo: 'bar'
      };
    }
  });

  registerPlugin('modifyDocumentProps', {
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
};
