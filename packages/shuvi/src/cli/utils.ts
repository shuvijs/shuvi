import { existsSync } from 'fs';
import path from 'path';
import { CommanderStatic } from 'commander';

export function getProjectDir(cmd: CommanderStatic): string {
  const dir = path.resolve(cmd.args[0] || '.');
  if (!existsSync(dir)) {
    console.error(`> No such directory exists as the project root: ${dir}`);
    cmd.outputHelp();
    process.exit(1);
  }
  return dir;
}
