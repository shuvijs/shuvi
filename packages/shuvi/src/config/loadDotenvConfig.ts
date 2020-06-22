import dotenv, { DotenvConfigOutput } from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import fs from 'fs';
import path from 'path';

export const loadDotenvConfig = (dir: string) => {
  const mode = process.env.NODE_ENV!;

  // Priority top to bottom
  const dotenvFiles = [
    `.env.${mode}.local`,
    `.env.local`,
    `.env.${mode}`,
    '.env'
  ];

  let envsFromDotEnv = {};
  for (const envFile of dotenvFiles) {
    const dotEnvPath = path.join(dir, envFile);

    try {
      const stats = fs.statSync(dotEnvPath);

      if (!stats.isFile()) {
        continue;
      }

      const contents = fs.readFileSync(dotEnvPath, 'utf8');

      try {
        let result: DotenvConfigOutput = {};
        result.parsed = dotenv.parse(contents);

        // dotenvExpand will not replace env that is already saved in process.env
        // https://github.com/motdotla/dotenv-expand/blob/de9e5cb0215495452f475f5be4dea1580b8217cd/lib/main.js#L22
        result = dotenvExpand(result);

        if (result.parsed) {
          console.log(`Loaded env from ${path.join(dir, envFile)}`);
          envsFromDotEnv = {
            ...envsFromDotEnv,
            ...result.parsed
          };
        }
      } catch (err) {
        console.error(
          `Failed to load env from ${path.join(dir, envFile)}`,
          err
        );
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw new Error(`Failed to load env from ${envFile}\n${err}`);
      }
    }
  }

  Object.assign(process.env, envsFromDotEnv);
};
