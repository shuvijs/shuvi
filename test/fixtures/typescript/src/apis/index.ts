type resData = {
  data: string;
};

export default (req: any, res: any) => {
  const data: resData = { data: 'apis index success' };
  return res.send(data);
};
