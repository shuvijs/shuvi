#!/usr/bin/env node
import program from 'commander';
import * as spawn from 'cross-spawn';
import logger from '@shuvi/utils/logger';
import { getPackageInfo } from './utils';

const Commands = ['dev', 'build', 'serve', 'inspect'] as const;

type CommandName = typeof Commands[number];

const pkgInfo = getPackageInfo();

// must be before .parse()
program.on('--help', () => {
  logger.info('');
  logger.info('Avaliable cmds:');
  logger.info(`  ${Commands.join(', ')}`);
});

program.name('shuvi').version(pkgInfo.version).usage('<cmd> [options]');
program.allowUnknownOption().parse();

const args = program.args;
const [cmd, ...commandArgs] = args.length ? args : ['dev'];

if (!Commands.includes(cmd as CommandName)) {
  logger.error('Unknown command "' + cmd + '".');
  program.outputHelp();
  process.exit(1);
}

const nodeEnv = cmd === 'dev' ? 'development' : 'production';

const result = spawn.sync(
  'node',
  [
    require.resolve('./agent'),
    require.resolve('./cmds/' + cmd),
    ...commandArgs
  ],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: nodeEnv
    }
  }
);
if (result.signal) {
  if (result.signal === 'SIGKILL') {
    logger.error(
      'The build failed because the process exited too early. ' +
        'This probably means the system ran out of memory or someone called ' +
        '`kill -9` on the process.'
    );
  } else if (result.signal === 'SIGTERM') {
    logger.error(
      'The build failed because the process exited too early. ' +
        'Someone might have called `kill` or `killall`, or the system could ' +
        'be shutting down.'
    );
  }
  process.exit(1);
}
process.exit(result.status!);
