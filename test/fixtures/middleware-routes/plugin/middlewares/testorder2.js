export default (req, res, next) => {
  console.log('plugin 2');
  next();
};
