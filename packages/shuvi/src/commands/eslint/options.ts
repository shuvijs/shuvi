import { Option } from 'commander';

export const optionDir = new Option(
  '-d, --dir <dirPath>',
  `Include directory, or directories, to run ESLint`
).default(['src']);

export const optionFile = new Option(
  '--file <file...>',
  `Include file, or files, to run ESLint`
).default([]);

export const optionStrict = new Option(
  '--strict',
  `Creates an .eslintrc.json file using the shuvi.js strict configuration (only possible if no .eslintrc.json file is present)`
).default(false);

export const optionConfig = new Option(
  '-c, --config <config>',
  `Use this configuration file, overriding all other config options`
).default(null);

export const optionExt = new Option(
  '--ext <ext...>',
  `Specify JavaScript file extensions`
).default(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.mts', '.cts', '.tsx']);

export const optionResolvePluginsRelativeTo = new Option(
  '--resolve-plugins-relative-to <path>',
  `A folder where plugins should be resolved from, CWD by default`
).default(null, 'CWD');

export const optionRulesDir = new Option(
  '--rulesDir <path...>',
  `Use additional rules from this directory`
).default([]);

export const optionFix = new Option(
  '--fix',
  `Automatically fix problems`
).default(false);

export const optionFixType = new Option(
  '--fix-type <type...>',
  `Specify the types of fixes to apply (problem, suggestion, layout)`
).default(null);

export const optionIgnorePath = new Option(
  '--ignore-path <filePath>',
  `Specify path of ignore file`
).default(null);

export const optionNoIgnore = new Option(
  '--no-ignore',
  `Disable use of ignore files and patterns`
).default(false);

export const optionQuiet = new Option('--quiet', `Report errors only`).default(
  false
);

export const optionMaxWarnings = new Option(
  '--max-warnings',
  `Number of warnings to trigger nonzero exit code`
).default(-1);

export const optionOutputFile = new Option(
  '-o, --output-file <path>',
  `Specify file to write report to`
).default(null);

export const optionFormat = new Option(
  '-f, --format <format>',
  `Use a specific output format`
).default(null, 'Shuvi.js custom formatter');

export const optionNoInlineConfig = new Option(
  '--no-inline-config',
  `Prevent comments from changing config or rules`
).default(false);

export const optionReportUnusedDisableDirectives = new Option(
  '--report-unused-disable-directives',
  `Adds reported errors for unused eslint-disable directives ("error" | "warn" | "off")`
).default(null);

export const optionNoCache = new Option(
  '--no-cache',
  `Disable caching`
).default(false);

export const optionCacheLocation = new Option(
  '--cache-location <location>',
  `Path to the cache file or directory`
).default('.eslintcache');

export const optionCacheStrategy = new Option(
  '--cache-strategy <strategy>',
  `Strategy to use for detecting changed files in the cache, either metadata or content`
).default('metadata');

export const optionErrorOnUnmatchedPattern = new Option(
  '--error-on-unmatched-pattern',
  `Show errors when any file patterns are unmatched - default: false`
).default(false);
