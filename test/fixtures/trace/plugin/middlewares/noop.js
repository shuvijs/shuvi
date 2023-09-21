export default async (req, res, next) => {
  console.log('this is a noop middleware, before next');
  next();
  console.log('this is a noop middleware, after next');
};
