import setHeader from './api/set-header.js';
import setCookie from './api/set-cookie';
import healthCheck from './api/health-check';
import user from './api/user';
import setting from './api/setting';
import modifyHtml from './api/modify-html';

export const serverMiddleware = [
  'koa-lowercase',
  setHeader,
  { path: '/health-check*', handler: setCookie },
  { path: '/health-check', handler: healthCheck },
  { path: '/health-check2', handler: healthCheck }, // Note: share handler with other path
  {
    path: '/health-check3',
    handler: healthCheck
  },

  { path: '/users/:id', handler: user },
  { path: '/profile/:id/setting*', handler: setting },

  { path: '/home', handler: modifyHtml },

  {
    path: '/testorder',
    handler: (ctx, next) => {
      console.log('user default order');
      return next();
    }
  },
  {
    path: '/testorder',
    handler: (ctx, next) => {
      console.log(10);
      return next();
    },
    order: 10
  },
  {
    path: '/testRenderToHTML',
    handler: async ctx => {
      const html = await ctx.shuvi.renderToHTML(ctx.req, ctx.res);
      console.log({ html, type: typeof html });
      ctx.body = html.replace(/renderToHtml/, 'renderByMiddleware');
      return html;
    }
  }
];
