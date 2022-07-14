import { IServerModule as _IServerModule } from '../shared';

type ServerModule = Required<_IServerModule>;

export type GetPageDataFunction = ServerModule['getPageData'];

export type HandlePageRequestFunction = ServerModule['handlePageRequest'];

export type ModifyHtmlFunction = ServerModule['modifyHtml'];
