import setHeader from './routes/api/set-header/api';
import setCookie from './routes/api/set-cookie/api';
import healthCheck from './routes/api/health-check/api';
import user from './routes/api/user/api';
import setting from './routes/api/setting/api';
import modifyHtml from './routes/api/modify-html/api';

export const middlewares = [
  setHeader,
  { path: '/health-check:other(.*)', handler: setCookie },
  { path: '/health-check', handler: healthCheck },
  { path: '/health-check2', handler: healthCheck }, // Note: share handler with other path
  {
    path: '/health-check3',
    handler: healthCheck
  },

  { path: '/users/:id', handler: user },
  { path: '/profile/:id/setting:other(.*)', handler: setting },

  { path: '/home', handler: modifyHtml },

  {
    path: '/testorder',
    handler: (req, res, next) => {
      console.log('user default order');
      return next();
    }
  },
  {
    path: '/testorder',
    handler: (req, res, next) => {
      console.log(10);
      return next();
    }
  }
];
