export default (req, res) => {
  res.status(200).json({
    query: req.query,
    params: req.params
  });
};
