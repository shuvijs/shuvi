export function render(renderAppToString, appContext) {
  if (appContext.notFound) {
    return '404 Custom HTML';
  }
  return renderAppToString();
}

export function onViewDone(req, res, { html, appContext }) {
  if (appContext.notFound) {
    res.statusCode = 404;
    res.end(html);
  }
}

export const pageData = () => {
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
    console.log('custom-renderToHTML', html);
    return html;
  };
};
