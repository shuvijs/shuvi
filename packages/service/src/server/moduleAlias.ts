// https://github.com/ilearnio/module-alias/blob/dev/index.js
import BuiltinModule from 'module';
import nodePath from 'path';

interface module {
  _nodeModulePaths:(...args: any[])=>string[],
  _resolveFilename:(...args: any[])=> any
}
// Guard against poorly mocked module constructors
const Module = (
  module.constructor.length > 1
    ? module.constructor
    : BuiltinModule
) as unknown as module

const modulePaths:string[] = []
const moduleAliases: Record<string, string> = {}
let moduleAliasNames: string[] = []

const oldNodeModulePaths = Module._nodeModulePaths
Module._nodeModulePaths = function (from) {
  let paths = oldNodeModulePaths.call(this, from)

  // Only include the module path for top-level modules
  // that were not installed:
  if (from.indexOf('node_modules') === -1) {
    paths = modulePaths.concat(paths)
  }

  return paths
}

function isPathMatchesAlias (path: string, alias: string) {
  // Matching /^alias(\/|$)/
  if (path.indexOf(alias) === 0) {
    if (path.length === alias.length) return true
    if (path[alias.length] === '/') return true
  }
  return false
}

const oldResolveFilename = Module._resolveFilename
Module._resolveFilename = function (request, parentModule, isMain, options) {
  for (let i = moduleAliasNames.length; i-- > 0;) {
    const alias = moduleAliasNames[i]
    if (isPathMatchesAlias(request, alias)) {
      let aliasTarget = moduleAliases[alias]
      request = nodePath.join(aliasTarget, request.substr(alias.length))
      // Only use the first match
      break
    }
  }

  return oldResolveFilename.call(this, request, parentModule, isMain, options)
}

export function addAlias (alias: string, target: string): void {
  moduleAliases[alias] = target
  // Cost of sorting is lower here than during resolution
  moduleAliasNames = Object.keys(moduleAliases)
  moduleAliasNames.sort()
}
