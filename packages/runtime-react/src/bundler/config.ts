import { IApi, IHookBundlerConfig } from "@shuvi/types";
// @ts-ignore
import AliasPlugin from "enhanced-resolve/lib/AliasPlugin";

export function config(api: IApi) {
  const resolveLocal = (m: string) => require.resolve(m);
  const resolveUser = (m: string) =>
    require.resolve(m, { paths: [api.paths.rootDir] });

  api.tap<IHookBundlerConfig>("bundler:config", {
    name: "runtime-react",
    fn: config => {
      // const oriExternal = config.get("externals");
      // const external: webpack.ExternalsFunctionElement = (
      //   context,
      //   request,
      //   callback
      // ) => {
      //   const externals = [
      //     /@shuvi[/\/]runtime-react[/\/]lib[/\/]loadble/,
      //     /@shuvi[/\/]runtime-react[/\/]es[/\/]loadble/
      //   ];

      //   function external() {
      //     return callback(null, `commonjs ${request}`);
      //   }

      //   if (externals.some(test => test.test(request))) {
      //     return external();
      //   }
      // };

      // config.externals(external);
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
