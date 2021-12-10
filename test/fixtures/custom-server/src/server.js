export function render(renderAppToString, appContext) {
  if (appContext.forbidden) {
    return '403 Custom HTML by custom render';
  }
  return renderAppToString();
}

export function onViewDone({ res, html, appContext }) {
  if (appContext.forbidden) {
    res.statusCode = 403;
    res.end(html);
  }
}

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
    console.log('custom-renderToHTML', html);
    return html;
  };
};
