import { Compiler } from '@shuvi/toolpack/lib/webpack';
// @ts-ignore
import ConstDependency from 'webpack/lib/dependencies/ConstDependency';
// @ts-ignore
import ProvidedDependency from 'webpack/lib/dependencies/ProvidedDependency';
// @ts-ignore
import { approve } from 'webpack/lib/javascript/JavascriptParserHelpers';

const EnvProvider = '@tarojs/runtime';

const Definitions: { [key: string]: string[] } = {
  window: [EnvProvider, 'window'],
  document: [EnvProvider, 'document'],
  navigator: [EnvProvider, 'navigator'],
  requestAnimationFrame: [EnvProvider, 'requestAnimationFrame'],
  cancelAnimationFrame: [EnvProvider, 'cancelAnimationFrame'],
  Element: [EnvProvider, 'TaroElement'],
  SVGElement: [EnvProvider, 'TaroElement']
};

function shouldSkip(file: string) {
  const normalizedPath = file.replace(/\\+/g, '/');
  return normalizedPath.indexOf(`node_modules/${EnvProvider}`) !== -1;
}

export default class DomEnvPlugin {
  apply(compiler: Compiler) {
    const definitions = Definitions;
    compiler.hooks.compilation.tap(
      'DomEnvPlugin',
      (compilation, { normalModuleFactory }) => {
        compilation.dependencyTemplates.set(
          ConstDependency,
          new ConstDependency.Template()
        );
        compilation.dependencyFactories.set(
          ProvidedDependency,
          normalModuleFactory
        );
        compilation.dependencyTemplates.set(
          ProvidedDependency,
          new ProvidedDependency.Template()
        );
        const handler = (parser: any, parserOptions: any) => {
          Object.keys(definitions).forEach(name => {
            const request = ([] as string[]).concat(definitions[name]);
            const splittedName = name.split('.');
            if (splittedName.length > 0) {
              splittedName.slice(1).forEach((_, i) => {
                const name = splittedName.slice(0, i + 1).join('.');
                parser.hooks.canRename.for(name).tap('DomEnvPlugin', approve);
              });
            }

            parser.hooks.expression
              .for(name)
              .tap('DomEnvPlugin', (expr: any) => {
                if (shouldSkip(parser.state.module.context)) {
                  return;
                }

                const nameIdentifier = name.includes('.')
                  ? `__webpack_provided_${name.replace(/\./g, '_dot_')}`
                  : name;
                const dep = new ProvidedDependency(
                  request[0],
                  nameIdentifier,
                  request.slice(1),
                  expr.range
                );
                dep.loc = expr.loc;
                parser.state.module.addDependency(dep);
                return true;
              });

            parser.hooks.call.for(name).tap('DomEnvPlugin', (expr: any) => {
              if (shouldSkip(parser.state.module.context)) {
                return;
              }

              const nameIdentifier = name.includes('.')
                ? `__webpack_provided_${name.replace(/\./g, '_dot_')}`
                : name;
              const dep = new ProvidedDependency(
                request[0],
                nameIdentifier,
                request.slice(1),
                expr.callee.range
              );
              dep.loc = expr.callee.loc;
              parser.state.module.addDependency(dep);
              parser.walkExpressions(expr.arguments);
              return true;
            });
          });
        };
        normalModuleFactory.hooks.parser
          .for('javascript/auto')
          .tap('DomEnvPlugin', handler);
        normalModuleFactory.hooks.parser
          .for('javascript/dynamic')
          .tap('DomEnvPlugin', handler);
        normalModuleFactory.hooks.parser
          .for('javascript/esm')
          .tap('DomEnvPlugin', handler);
      }
    );
  }
}
