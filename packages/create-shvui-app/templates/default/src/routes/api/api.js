export default (req, res) => {
  if (req.method === 'POST') {
    return res.status(200).json(req.body);
  }
  return res.send('Hello World!');
};
