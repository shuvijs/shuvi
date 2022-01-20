export const getContentProxyObj = (Obj: {
  [key: string]: string | undefined;
}): string => {
  const statements: string[] = [];
  const sources = Object.keys(Obj);

  for (let source of sources) {
    const exportContents = Obj[source];
    statements.push(
      `proxyObj.${source} ${
        exportContents
          ? ` = function() {return require("${exportContents}")}`
          : ''
      };`
    );
  }

  return `
const proxyObj = {};
module.exports = proxyObj;
  ${statements.join('\n')}
  `;
};
