import { ShuviRequestHandler } from '../index';

const repeatedSlashesRegex = /(\\)|([\/\\]{2,})/g;

export const validateUrlMiddleware: ShuviRequestHandler = async (
  req,
  res,
  next
) => {
  const isUrlInvalid = repeatedSlashesRegex.test(req.pathname);
  if (isUrlInvalid) {
    const newPathname = req.pathname.replace(repeatedSlashesRegex, '/');
    const newUrl = req.url.replace(req.pathname, newPathname);
    res.writeHead(308, {
      Location: newUrl
    });
    res.end();
    return;
  }
  next();
};
