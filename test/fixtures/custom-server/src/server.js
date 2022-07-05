export const getPageData = () => {
  return {
    foo: 'bar'
  };
};

export const renderToHTML = renderToHTML => {
  return async (req, res) => {
    const html = await renderToHTML(req, res);
    console.log('custom-renderToHTML', html);
    return html;
  };
};
