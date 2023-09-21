export default (req, res) => {
  console.log('res.statusCode------------', res.statusCode);

  throw Error('this is an error api');
};
