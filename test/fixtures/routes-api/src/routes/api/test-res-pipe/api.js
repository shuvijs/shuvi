import got from 'got';
export default async (req, res) => {
  const dataRes = await got(
    `${decodeURIComponent(req.query.url)}?hello=from-pipe`,
    {
      isStream: true
    }
  );

  res.status(dataRes.statusCode);
  dataRes.pipe(res);
};
