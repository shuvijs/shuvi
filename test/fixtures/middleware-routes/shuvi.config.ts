import { defineConfig } from 'shuvi';

export default defineConfig({
  ssr: true,
  plugins: [['./plugin']],
  middlewareRoutes: [
    {
      path: '/*',
      middleware: 'middlewares/set-header/index.js'
    },
    {
      path: '/health-check:other(.*)',
      middleware: 'middlewares/set-cookie/index.js'
    },
    {
      path: '/health-check',
      middleware: 'middlewares/health-check/index.js'
    },
    {
      path: '/health-check2',
      middleware: 'middlewares/health-check/index.js'
    },
    {
      path: '/health-check3',
      middleware: 'middlewares/health-check/index.js'
    },
    { path: '/users/:id+', middleware: 'middlewares/user/index.js' },
    {
      path: '/profile/:id/setting:other(.*)',
      middleware: 'middlewares/setting/index.js'
    },
    { path: '/home', middleware: 'middlewares/modify-html/index.js' },
    {
      path: '/testorder',
      middleware: 'middlewares/testorder1.js'
    },
    {
      path: '/testorder',
      middleware: 'middlewares/testorder2.js'
    }
  ]
});
