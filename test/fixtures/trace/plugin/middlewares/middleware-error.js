export default async (req, res, next) => {
  console.log('res.statusCode------------', res.statusCode);
  throw Error('this is an error middleware');
};
