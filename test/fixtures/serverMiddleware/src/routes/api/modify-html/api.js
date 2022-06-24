// https://github.com/mo22/express-modify-response
function expressModifyResponse(checkCallback, modifyCallback) {
  return function (req, res, next) {
    var _end = res.end;
    var _write = res.write;
    var checked = false;
    var buffers = [];
    var addBuffer = (chunk, encoding) => {
      if (chunk === undefined) return;
      if (typeof chunk === 'string') {
        chunk = Buffer.from(chunk, encoding);
      }
      buffers.push(chunk);
    };
    res.write = function write(chunk, encoding) {
      if (!checked) {
        checked = true;
        var hook = checkCallback(req, res);
        if (!hook) {
          res.end = _end;
          res.write = _write;
          return res.write(chunk, encoding);
        } else {
          res.statusCode = 200; // set statusCode 200 by self
          addBuffer(chunk, encoding);
        }
      } else {
        addBuffer(chunk, encoding);
      }
    };
    res.end = function end(chunk, encoding) {
      if (!checked) {
        checked = true;
        var hook = checkCallback(req, res);
        if (!hook) {
          res.end = _end;
          res.write = _write;
          return res.end(chunk, encoding);
        } else {
          res.statusCode = 200; // set statusCode 200 by self
          addBuffer(chunk, encoding);
        }
      } else {
        addBuffer(chunk, encoding);
      }
      var buffer = Buffer.concat(buffers);
      Promise.resolve(modifyCallback(req, res, buffer))
        .then(result => {
          if (typeof result === 'string') {
            result = Buffer.from(result);
          }
          if (res.getHeader('Content-Length')) {
            res.setHeader('Content-Length', String(result.length));
          }
          res.end = _end;
          res.write = _write;
          res.write(result);
          res.end();
        })
        .catch(e => {
          // handle?
          next(e);
        });
    };
    next();
  };
}
export default function modifyHtml(req, res, next) {
  return expressModifyResponse(
    (req, res) => {
      // return true if you want to modify the response later
      if (res.getHeader('Content-Type').startsWith('text/html')) return true;
      return false;
    },
    (req, res, body) => {
      // body is a Buffer with the current response; return Buffer or string with the modified response
      // can also return a Promise.
      return body.toString()?.replace('$TO_BE_MODIFIED', 'modified');
    }
  )(req, res, next);
}
