#!/usr/bin/env node
import { Command } from 'commander';
import makeDevCommand from './commands/dev';
import makeBuildCommand from './commands/build';
import makeInspectCommand from './commands/inspect';
import makeServeCommand from './commands/serve';
// import makeLintCommand from './commands/lint';
import { TITLE, HELPER } from './constants';
import { optionNoColor } from './commands/utils/options';
import { getPackageInfo, color } from './utils';

const { name, description, version } = getPackageInfo();
const program = new Command();

const devCommand = makeDevCommand().copyInheritedSettings(program);
const buildCommand = makeBuildCommand().copyInheritedSettings(program);
const inspectCommand = makeInspectCommand().copyInheritedSettings(program);
const serveCommand = makeServeCommand().copyInheritedSettings(program);
// const lintCommand = makeLintCommand().copyInheritedSettings(program);

program
  .name(name)
  .description(description)
  .version(version)
  .showHelpAfterError('(add --help for additional information)')
  .addOption(optionNoColor)
  .addCommand(devCommand)
  .addCommand(buildCommand)
  .addCommand(inspectCommand)
  .addCommand(serveCommand)
  // .addCommand(lintCommand)
  .usage(`[command] [dir] [options]`)
  .configureHelp({
    subcommandTerm: cmd => {
      return `${cmd.name()} ${cmd.usage()}`;
    }
  })
  .addHelpText('beforeAll', TITLE)
  .addHelpText('after', HELPER)
  .configureOutput({
    outputError: (str, write) => write(color.error(str)) // Highlight errors in color.
  })
  .parseAsync(process.argv);
