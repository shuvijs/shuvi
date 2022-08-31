// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function initMiddleware(middleware) {
  return (req, res) =>
    new Promise((resolve, reject) => {
      middleware(req, res, result => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
}

function Cors(options) {
  return function (req, res, next) {
    if (req.method === 'OPTIONS') {
      const { methods } = options;
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('access-control-allow-methods', methods.join(','));
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.status(204);
      res.end();
    } else {
      return next();
    }
  };
}

// Initialize the cors middleware
const cors = initMiddleware(
  Cors({
    methods: ['GET', 'POST', 'OPTIONS']
  })
);

export default async function (req, res) {
  // Run cors
  await cors(req, res);

  // Rest of the API logic
  res.send({ message: 'Hello Everyone!' });
}
