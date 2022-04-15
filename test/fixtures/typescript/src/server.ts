import { IServerModule } from 'shuvi';

export const getPageData = () => {
  return {};
};

export const modifyHtml: IServerModule['modifyHtml'] = documentProps => {
  return documentProps;
};

export const renderToHTML: IServerModule['renderToHTML'] = renderToHTML => {
  return async (req, res) => {
    const html = await renderToHTML(req, res);
    return html;
  };
};
