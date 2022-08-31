export default (req, res, next) => {
  console.log('plugin 1');
  next();
};
