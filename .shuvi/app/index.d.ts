declare module '@shuvi/app' {
  export * as Runtime from '@shuvi/platform-core';
  export { createPlugin as createRuntimePlugin } from '@shuvi/runtime-core/lib/runtimeHooks';
  export { matchRoutes } from '@shuvi/router';
  export { getPageData } from '/Users/lixi/Workspace/github/shuvi/packages/runtime-core/lib/helper/getPageData';
  export { default as getRuntimeConfig } from '@shuvi/service/lib/lib/runtimeConfig';
  export * as RuntimeServer from '@shuvi/platform-web/lib/types';
  export { default as App } from '/Users/lixi/Workspace/github/shuvi/packages/platform-web/shuvi-app/react/App';
  export { default as Head } from '/Users/lixi/Workspace/github/shuvi/packages/platform-web/shuvi-app/react/head/head';
  export { default as dynamic } from '/Users/lixi/Workspace/github/shuvi/packages/platform-web/shuvi-app/react/dynamic';
  export {
    useParams,
    useRouter,
    useCurrentRoute,
    Link,
    RouterView,
    withRouter
  } from '/Users/lixi/Workspace/github/shuvi/packages/router-react';
}
