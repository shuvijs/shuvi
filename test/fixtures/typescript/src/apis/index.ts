type resData = {
  data: string;
};
export default (req, res) => {
  const data: resData = { data: 'apis index success' };
  return res.send(data);
};
