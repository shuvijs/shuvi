/* eslint-disable prefer-template */
import chalk from 'chalk';
import path from 'path';

// eslint-disable-next-line no-shadow
export enum MessageSeverity {
  Warning = 1,
  Error = 2
}

interface LintMessage {
  ruleId: string | null;
  severity: 1 | 2;
  message: string;
  line: number;
  column: number;
}

export interface LintResult {
  filePath: string;
  messages: LintMessage[];
  errorCount: number;
  warningCount: number;
  output?: string;
  source?: string;
}

function pluginCount(messages: LintMessage[]): {
  pluginErrorCount: number;
  pluginWarningCount: number;
} {
  let pluginWarningCount = 0;
  let pluginErrorCount = 0;

  for (let i = 0; i < messages.length; i++) {
    const { severity, ruleId } = messages[i];

    if (ruleId?.includes('@shuvi/shuvi')) {
      if (severity === MessageSeverity.Warning) {
        pluginWarningCount += 1;
      } else {
        pluginErrorCount += 1;
      }
    }
  }

  return {
    pluginErrorCount,
    pluginWarningCount
  };
}

function formatMessage(
  dir: string,
  messages: LintMessage[],
  filePath: string
): string {
  let fileName = path.posix.normalize(
    path.relative(dir, filePath).replace(/\\/g, '/')
  );

  if (!fileName.startsWith('.')) {
    fileName = './' + fileName;
  }

  let output = '\n' + chalk.cyan(fileName);

  for (let i = 0; i < messages.length; i++) {
    const { message, severity, line, column, ruleId } = messages[i];

    output = output + '\n';

    if (line && column) {
      output =
        output +
        chalk.yellow(line.toString()) +
        ':' +
        chalk.yellow(column.toString()) +
        '  ';
    }

    if (severity === MessageSeverity.Warning) {
      output += chalk.yellow.bold('Warning') + ': ';
    } else {
      output += chalk.red.bold('Error') + ': ';
    }

    output += message;

    if (ruleId) {
      output += '  ' + chalk.gray.bold(ruleId);
    }
  }

  return output;
}

export function formatResults(
  baseDir: string,
  results: LintResult[],
  format: (r: LintResult[]) => string
): {
  output: string;
  outputWithMessages: string;
  totalShuviPluginErrorCount: number;
  totalShuviPluginWarningCount: number;
} {
  let totalShuviPluginErrorCount = 0;
  let totalShuviPluginWarningCount = 0;
  let resultsWithMessages = results.filter(({ messages }) => messages?.length);

  // Track number of shuvi.js plugin errors and warnings
  resultsWithMessages.forEach(({ messages }) => {
    const res = pluginCount(messages);
    totalShuviPluginErrorCount += res.pluginErrorCount;
    totalShuviPluginWarningCount += res.pluginWarningCount;
  });

  // Use user defined formatter or Shuvi.js's built-in custom formatter
  const output = format
    ? format(resultsWithMessages)
    : resultsWithMessages
        .map(({ messages, filePath }) =>
          formatMessage(baseDir, messages, filePath)
        )
        .join('\n');

  return {
    output: output,
    outputWithMessages:
      resultsWithMessages.length > 0
        ? output +
          `\n\n${chalk.cyan(
            'info'
          )}  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules`
        : '',
    totalShuviPluginErrorCount,
    totalShuviPluginWarningCount
  };
}
