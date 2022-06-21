export const getPageData = () => {
  return {
    foo: 'bar'
  };
};

export const modifyHtml = documentProps => {
  documentProps.headTags.push({
    tagName: 'meta',
    attrs: {
      name: 'testDocumentProps'
    }
  });
  return documentProps;
};

export const renderToHTML = renderToHTML => {
  return async (req, res) => {
    const html = await renderToHTML(req, res);
    return html;
  };
};
