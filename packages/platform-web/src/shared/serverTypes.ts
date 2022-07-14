import { ServerPluginConstructor } from '@shuvi/service';

export interface IServerModule {
  getPageData?: ServerPluginConstructor['getPageData'];
  handlePageRequest?: ServerPluginConstructor['handlePageRequest'];
  modifyHtml?: ServerPluginConstructor['modifyHtml'];
}
