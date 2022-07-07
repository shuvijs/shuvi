export const getPageData = () => {
  return {
    foo: 'bar'
  };
};

export const handlePageRequest = originalHandlePageRequest => {
  return async (req, res) => {
    await originalHandlePageRequest(req, res);
    console.log('test-handle-page-request');
  };
};
