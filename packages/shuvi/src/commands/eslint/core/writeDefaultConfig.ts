import { promises as fs } from 'fs';
import chalk from 'chalk';
import os from 'os';
import path from 'path';
import * as CommentJson from 'comment-json';
import { ConfigAvailable } from './hasEslintConfiguration';

export async function writeDefaultConfig(
  baseDir: string,
  { exists, emptyEslintrc, emptyPkgJsonConfig }: ConfigAvailable,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedConfig: any,
  eslintrcFile: string | null,
  pkgJsonPath: string | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  packageJsonConfig: { eslintConfig: any } | null
) {
  if (!exists && emptyEslintrc && eslintrcFile) {
    const ext = path.extname(eslintrcFile);

    let newFileContent;
    if (ext === '.yaml' || ext === '.yml') {
      newFileContent = "extends: 'shuvi'";
    } else {
      newFileContent = CommentJson.stringify(selectedConfig, null, 2);

      if (ext === '.js') {
        newFileContent = `module.exports = ${newFileContent}`;
      }
    }

    await fs.writeFile(eslintrcFile, newFileContent + os.EOL);

    console.info(
      `We detected an empty ESLint configuration file (${chalk.bold(
        path.basename(eslintrcFile)
      )}) and updated it for you!`
    );
  } else if (!exists && emptyPkgJsonConfig && packageJsonConfig) {
    packageJsonConfig.eslintConfig = selectedConfig;

    if (pkgJsonPath) {
      await fs.writeFile(
        pkgJsonPath,
        CommentJson.stringify(packageJsonConfig, null, 2) + os.EOL
      );
    }

    console.info(
      `We detected an empty ${chalk.bold(
        'eslintConfig'
      )} field in package.json and updated it for you!`
    );
  } else if (!exists) {
    await fs.writeFile(
      path.join(baseDir, '.eslintrc.json'),
      CommentJson.stringify(selectedConfig, null, 2) + os.EOL
    );

    console.log(
      chalk.green(
        `We created the ${chalk.bold(
          '.eslintrc.json'
        )} file for you and included your selected configuration.`
      )
    );
  }
}
