type Command = (argv: string[]) => void;

// fix yarn link with react hooks
if (process.env.SHUVI__SECRET_FIX_LOCAL_RESOLVE) {
  const path = require('path');
  const resolveNodeModule = (req: string) =>
    path.resolve(__dirname, '../../../../node_modules', req);

  const BuiltinModule = require('module');
  // Guard against poorly mocked module constructors
  const Module =
    module.constructor.length > 1 ? module.constructor : BuiltinModule;

  const oldResolveFilename = Module._resolveFilename;
  Module._resolveFilename = function (
    request: string,
    parentModule: any,
    isMain: boolean,
    options: any
  ) {
    let redirectdRequest = request;
    // make sure these packages are resolved into project/node_modules/
    // this only works on server side
    if (['react', 'react-dom'].includes(request)) {
      redirectdRequest = resolveNodeModule(request);
    }

    return oldResolveFilename.call(
      this,
      redirectdRequest,
      parentModule,
      isMain,
      options
    );
  };
}

const args = process.argv.slice(2);
const [cmdPath, ...commandArgs] = args.length ? args : ['dev'];

const mod = require(cmdPath);
const cmd: Command = mod.default || mod;

cmd(commandArgs);
