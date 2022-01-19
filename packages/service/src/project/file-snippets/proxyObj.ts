export const getContentProxyObj = (
  Obj: { [key: string]: string | undefined },
  isCached?: boolean,
): string => {
  const statements: string[] = [];
  const sources = Object.keys(Obj);

  for (let source of sources) {
    const exportContents = Obj[source];
    statements.push(`proxyObj.${source} ${exportContents ? ` = function() {return require("${exportContents}")}` : ''};`);
  }

  return `
const proxyObj = {};
const isCached = `${JSON.s}`;
const proxyHandler = {
  get: function(target, props) {
    const value = target[props];
    if (typeof value === 'function') {
      const result = value();
      if (isCached) {
        proxyObj[props] = result;
      }
      return result;
    }
    return value;
  }
};
const proxy = new Proxy(proxyObj, proxyHandler);
module.exports = proxy;
  ${statements.join('\n')}
  `
};
