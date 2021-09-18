const express = require('express');
const { shuvi } = require('../../../packages/service/lib/index');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const config = process.env.CONFIGOVERRIDES
  ? JSON.parse(process.env.CONFIGOVERRIDES)
  : {};
const app = shuvi({
  dev,
  cwd: __dirname,
  config
});

app.prepare().then(() => {
  const handle = app.getRequestHandler();
  const server = express();

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Express server Ready on http://localhost:${port}`);
  });
});
