// port from typescript
import * as nodePath from 'path';

const directorySeparator = '/';

// Reserved characters, forces escaping of any non-word (or digit), non-whitespace character.
// It may be inefficient (we could just match (/[-[\]{}()*+?.,\\^$|#\s]/g), but this is future
// proof.
const reservedCharacterPattern = /[^\w\s\/]/g;

const commonPackageFolders: readonly string[] = ['node_modules'];
// does not match centeain directories or directories that start with a . character
const implicitExcludePathRegexPattern = `/((${commonPackageFolders.join(
  '|'
)})|([/.][^/]*))`;

interface WildcardMatcher {
  singleAsteriskRegexFragment: string;
  doubleAsteriskRegexFragment: string;
  replaceWildcardCharacter: (match: string) => string;
}

export interface FileMatcherPatterns {
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

const wildcardMatcher: WildcardMatcher = {
  singleAsteriskRegexFragment: '[^/]*',
  doubleAsteriskRegexFragment: '(/.+?)?',
  replaceWildcardCharacter: match =>
    replaceWildcardCharacter(match, wildcardMatcher.singleAsteriskRegexFragment)
};

/**
 * An "includes" path "foo" is implicitly a glob "foo/** /*" (without the space) if its last component has no extension,
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
  { doubleAsteriskRegexFragment, replaceWildcardCharacter }: WildcardMatcher
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

      subpattern += component.replace(
        reservedCharacterPattern,
        replaceWildcardCharacter
      );
    }

    hasWrittenComponent = true;
  }

  return subpattern;
}

export function getRegularExpressionsForWildcards(
  specs: readonly string[] | undefined,
  basePath: string
): readonly string[] | undefined {
  if (specs === undefined || specs.length === 0) {
    return undefined;
  }

  const result: string[] = [];

  for (const spec of specs) {
    if (spec) {
      let r = getSubPatternFromSpec(spec, basePath, wildcardMatcher);
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
  usage: 'exclude'
): string | undefined {
  const patterns = getRegularExpressionsForWildcards(specs, basePath);
  if (!patterns || !patterns.length) {
    return undefined;
  }

  const pattern = patterns.map(pattern => `(${pattern})`).join('|');
  // If excluding, match "foo/bar/baz...", but if including, only allow "foo".
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
  excludes: readonly string[] | undefined
): FileMatcherPatterns {
  const absolutePath = normalizePath(basePath);

  return {
    excludePattern: getRegularExpressionForWildcard(
      excludes,
      absolutePath,
      'exclude'
    )
  };
}

export function matchFile(
  file: string,
  patterns: FileMatcherPatterns,
  caseSensitive: boolean
): boolean {
  file = normalizePath(file);
  const excludeRegex =
    patterns.excludePattern &&
    getRegexFromPattern(patterns.excludePattern, caseSensitive);
  const implicitExcludeRegex = getRegexFromPattern(
    implicitExcludePathRegexPattern,
    caseSensitive
  );

  return (
    !implicitExcludeRegex.test(file) &&
    (!excludeRegex || !excludeRegex.test(file))
  );
}
