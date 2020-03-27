import { IApi, Hooks } from "@shuvi/types";
// @ts-ignore
import AliasPlugin from "enhanced-resolve/lib/AliasPlugin";

// const external: webpack.ExternalsFunctionElement = (
//   context,
//   request,
//   callback
// ) => {
//   ['react', 'react-dom', 'react-router', 'react-router-dom']
// };

export function config(api: IApi) {
  const resolveLocal = (m: string) => require.resolve(m);
  const resolveUser = (m: string) =>
    require.resolve(m, { paths: [api.paths.rootDir] });

  api.tap<Hooks.IBundlerConfig>("bundler:config", {
    name: "runtime-react",
    fn: config => {
      // const oriExternals = config.get("externals");
      // config.externals([external].concat(oriExternals));
      // WEBPACK5: using alias in webpack5
      config.resolve.plugin("react-alias").use(AliasPlugin, [
        "described-resolve",
        [
          {
            react$: [resolveUser("react"), resolveLocal("react")],
            "react-dom$": [resolveUser("react-dom"), resolveLocal("react-dom")]
          }
        ],
        "resolve"
      ]);
      return config;
    }
  });
}
