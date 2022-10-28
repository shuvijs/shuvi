export const getPageData = () => {
  return {
    foo: 'bar'
  };
};

export const handlePageRequest = originalHandlePageRequest => {
  return async (req, res) => {
    await originalHandlePageRequest(req, res);
    if (req.pathname === '/handlePageRequest') {
      console.log('test-handle-page-request');
    }
  };
};

export const sendHtml = originalSendHtml => {
  return async (req, res, html) => {
    await originalSendHtml(req, res, html);
    if (req.pathname === '/sendHtml') {
      console.log('test-sendHtml');
    }
  };
};
