const content = `import * as server from '@shuvi/app/user/server';
import * as document from '@shuvi/app/user/document';
import { default as apiRoutes } from '@shuvi/app/core/apiRoutes';
import * as application from '@shuvi/app/core/server/application';
import * as applicationSpa from '@shuvi/app/core/server/application-spa';
export { server, document, apiRoutes, application, applicationSpa };
export { view } from '@shuvi/app/core/platform'
`;
export default {
  content: () => content
};
