import { IServerModule } from 'shuvi';

export const getPageData = () => {
  return {};
};

export const handlePageRequest: IServerModule['handlePageRequest'] =
  originalHandlePageRequest => {
    return async (req, res) => {
      // FIXME: 类型有问题 不能build了 renderToHtml的类型是unknown
      await (originalHandlePageRequest as Function)(req, res);
    };
  };
