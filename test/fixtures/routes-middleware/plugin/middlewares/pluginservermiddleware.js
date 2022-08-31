export default async (req, res, next) => {
  next();
  res.end('pluginServerMiddleware');
};
