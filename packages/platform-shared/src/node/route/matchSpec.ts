// port from typescript
import * as nodePath from 'path';

const CharacterCodes = {
  asterisk: 42,
  question: 63
};

const directorySeparator = '/';

// Reserved characters, forces escaping of any non-word (or digit), non-whitespace character.
// It may be inefficient (we could just match (/[-[\]{}()*+?.,\\^$|#\s]/g), but this is future
// proof.
const reservedCharacterPattern = /[^\w\s\/]/g;

const commonPackageFolders: readonly string[] = ['node_modules'];
// does not match centeain directories like node_modules
const implicitExcludePathRegexPattern = `(?!(${commonPackageFolders.join(
  '|'
)})(/|$))`;

interface WildcardMatcher {
  singleAsteriskRegexFragment: string;
  doubleAsteriskRegexFragment: string;
  replaceWildcardCharacter: (match: string) => string;
}

export interface FileMatcherPatterns {
  includePattern: string | undefined;
  excludePattern: string | undefined;
}

function replaceWildcardCharacter(
  match: string,
  singleAsteriskRegexFragment: string
) {
  return match === '*'
    ? singleAsteriskRegexFragment
    : match === '?'
    ? '[^/]'
    : '\\' + match;
}

export type Usage = 'include' | 'exclude';

const includeMatcher: WildcardMatcher = {
  /**
   * Matches any single directory segment except for directory separators.
   */
  singleAsteriskRegexFragment: '[^/]*',
  /**
   * Regex for the ** wildcard. Matches any number of subdirectories. When used for including
   * files or directories, does not match subdirectories that start with a . character
   */
  doubleAsteriskRegexFragment: `(/${implicitExcludePathRegexPattern}[^/.][^/]*)*?`,
  replaceWildcardCharacter: match =>
    replaceWildcardCharacter(match, includeMatcher.singleAsteriskRegexFragment)
};

const excludeMatcher: WildcardMatcher = {
  singleAsteriskRegexFragment: '[^/]*',
  doubleAsteriskRegexFragment: '(/.+?)?',
  replaceWildcardCharacter: match =>
    replaceWildcardCharacter(match, excludeMatcher.singleAsteriskRegexFragment)
};

const wildcardMatchers: Record<Usage, WildcardMatcher> = {
  include: includeMatcher,
  exclude: excludeMatcher
};

/**
 * An "includes" or "exclude" path "foo" is implicitly a glob "foo/** /*" (without the space) if its last component has no extension,
 * and does not contain any glob characters itself.
 */
function isImplicitGlob(lastPathComponent: string): boolean {
  return !/[.*?]/.test(lastPathComponent);
}

function normalizePath(path: string, currentDirectory?: string) {
  return currentDirectory
    ? nodePath.posix.resolve(currentDirectory, path)
    : nodePath.posix.normalize(path);
}

function getNormalizedPathComponents(
  path: string,
  currentDirectory: string | undefined
) {
  const normalizedPath = normalizePath(path, currentDirectory);
  const comps = normalizedPath.split('/');
  if (comps.length && !comps[comps.length - 1]) comps.pop();
  return comps;
}

function getSubPatternFromSpec(
  spec: string,
  basePath: string,
  usage: Usage,
  {
    singleAsteriskRegexFragment,
    doubleAsteriskRegexFragment,
    replaceWildcardCharacter
  }: WildcardMatcher
): string | undefined {
  let subpattern = '';
  let hasWrittenComponent = false;
  const components = getNormalizedPathComponents(spec, basePath);
  const lastComponent = components[components.length - 1];

  // remove trailing slash
  components[0] = components[0].replace(/[/]$/, '');

  if (isImplicitGlob(lastComponent)) {
    components.push('**', '*');
  }

  for (let component of components) {
    if (component === '**') {
      subpattern += doubleAsteriskRegexFragment;
    } else {
      if (hasWrittenComponent) {
        subpattern += directorySeparator;
      }

      if (usage !== 'exclude') {
        let componentPattern = '';
        // The * and ? wildcards should not match directories or files that start with . if they
        // appear first in a component. Dotted directories and files can be included explicitly
        // like so: **/.*/.*
        if (component.charCodeAt(0) === CharacterCodes.asterisk) {
          componentPattern += '([^./]' + singleAsteriskRegexFragment + ')?';
          component = component.substring(1);
        } else if (component.charCodeAt(0) === CharacterCodes.question) {
          componentPattern += '[^./]';
          component = component.substring(1);
        }

        componentPattern += component.replace(
          reservedCharacterPattern,
          replaceWildcardCharacter
        );

        // Patterns should not include subfolders like node_modules unless they are
        // explicitly included as part of the path.
        //
        // As an optimization, if the component pattern is the same as the component,
        // then there definitely were no wildcard characters and we do not need to
        // add the exclusion pattern.
        if (componentPattern !== component) {
          subpattern += implicitExcludePathRegexPattern;
        }

        subpattern += componentPattern;
      } else {
        subpattern += component.replace(
          reservedCharacterPattern,
          replaceWildcardCharacter
        );
      }
    }

    hasWrittenComponent = true;
  }

  return subpattern;
}

export function getRegularExpressionsForWildcards(
  specs: readonly string[] | undefined,
  basePath: string,
  usage: Usage
): readonly string[] | undefined {
  if (specs === undefined || specs.length === 0) {
    return undefined;
  }

  const result: string[] = [];

  for (const spec of specs) {
    if (spec) {
      let r = getSubPatternFromSpec(
        spec,
        basePath,
        usage,
        wildcardMatchers[usage]
      );
      if (r) {
        result.push(r);
      }
    }
  }

  return result;
}

export function getRegularExpressionForWildcard(
  specs: readonly string[] | undefined,
  basePath: string,
  usage: Usage
): string | undefined {
  const patterns = getRegularExpressionsForWildcards(specs, basePath, usage);
  if (!patterns || !patterns.length) {
    return undefined;
  }

  const pattern = patterns.map(pattern => `(${pattern})`).join('|');
  // If excluding, match "foo/", but if including, only allow "foo".
  const terminator = usage === 'exclude' ? '($|/)' : '$';
  return `^(${pattern})${terminator}`;
}

export function getRegexFromPattern(
  pattern: string,
  caseSensitive: boolean
): RegExp {
  return new RegExp(pattern, caseSensitive ? '' : 'i');
}

export function getFileMatcherPatterns(
  basePath: string,
  includes: readonly string[] | undefined,
  excludes: readonly string[] | undefined
): FileMatcherPatterns {
  const absolutePath = normalizePath(basePath);

  return {
    includePattern: getRegularExpressionForWildcard(
      includes,
      absolutePath,
      'include'
    ),
    excludePattern: getRegularExpressionForWildcard(
      excludes,
      absolutePath,
      'exclude'
    )
  };
}

export function matchesSpecs(
  basePath: string,
  {
    includes,
    excludes,
    caseSensitive
  }: {
    includes?: string[];
    excludes?: string[];
    caseSensitive: boolean;
  }
): (path: string) => boolean {
  const patterns = getFileMatcherPatterns(basePath, includes, excludes);
  const includeRegex =
    patterns.includePattern &&
    getRegexFromPattern(patterns.includePattern, caseSensitive);
  const excludeRegex =
    patterns.excludePattern &&
    getRegexFromPattern(patterns.excludePattern, caseSensitive);

  if (includeRegex) {
    if (excludeRegex) {
      return path => !(includeRegex.test(path) && !excludeRegex.test(path));
    }
    return path => !includeRegex.test(path);
  }

  if (excludeRegex) {
    return path => excludeRegex.test(path);
  }

  return () => true;
}
