import { existsSync } from 'fs';
import * as path from 'path';
import { CommanderStatic } from 'commander';
import logger from '@shuvi/utils/lib/logger';
//@ts-ignore
import pkgInfo from '../package.json';

export function getPackageInfo() {
  return pkgInfo;
}

export function getProjectDir(
  cmd: CommanderStatic | Record<string, any>
): string {
  const dir = path.resolve(cmd.args[0] || '.');
  if (!existsSync(dir)) {
    logger.error(`> No such directory exists as the project root: ${dir}`);
    cmd.outputHelp();
    process.exit(1);
  }
  return dir;
}
