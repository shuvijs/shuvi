/// <reference types="node" />

type Module = NodeJS.Module;

function purgeCache(moduleName: string) {
  searchCache(moduleName, function (mod: Module) {
    delete require.cache[mod.id];
  });
  // @ts-ignore
  const pathCache = module.constructor._pathCache || {};
  Object.keys(pathCache).forEach(function (cacheKey) {
    if (cacheKey.indexOf(moduleName) > 0) {
      delete pathCache[cacheKey];
    }
  });
}

function searchCache(moduleName: string, callback: (mod: NodeJS.Module)=>void) {
  let modPath = require.resolve(moduleName);
  const mod = modPath && require.cache[modPath];
  if (mod) {
    (function traverse(mod) {
      // 检查该模块的子模块并遍历它们
      mod.children.forEach(function (child) {
        traverse(child);
      });
      callback(mod);
    })(mod);
  }
}

export default purgeCache;
