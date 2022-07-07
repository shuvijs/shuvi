import { IServerModule } from 'shuvi';

export const getPageData = () => {
  return {};
};

export const renderToHTML: IServerModule['renderToHTML'] = renderToHTML => {
  return async (req, res) => {
    // FIXME: 类型有问题 不能build了 renderToHtml的类型是unknown
    const html = await (renderToHTML as Function)(req, res);
    return html;
  };
};
