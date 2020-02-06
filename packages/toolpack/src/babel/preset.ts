import { PluginItem } from "@babel/core";

const env = process.env.NODE_ENV;
const isProduction = env === "production";
const isDevelopment = env === "development";
const isTest = env === "test";

type CustomPresetOptions = {
  "preset-env"?: any;
  "preset-react"?: any;
  "transform-runtime"?: any;
};

type BabelPreset = {
  presets?: PluginItem[] | null;
  plugins?: PluginItem[] | null;
  sourceType?: "script" | "module" | "unambiguous";
  overrides?: any[];
};

// Taken from https://github.com/babel/babel/commit/d60c5e1736543a6eac4b549553e107a9ba967051#diff-b4beead8ad9195361b4537601cc22532R158
function supportsStaticESM(caller: any) {
  return !!(caller && caller.supportsStaticESM);
}

export default (api: any, options: CustomPresetOptions = {}): BabelPreset => {
  const supportsESM = api.caller(supportsStaticESM);
  const isNode = api.caller((caller: any) => !!caller && caller.isNode);
  const presetEnvConfig = {
    // In the test environment `modules` is often needed to be set to true, babel figures that out by itself using the `'auto'` option
    // In production/development this option is set to `false` so that webpack can handle import/export with tree-shaking
    modules: "auto",
    exclude: ["transform-typeof-symbol"],
    ...options["preset-env"],
  };

  // When transpiling for the server or tests, target the current Node version
  // if not explicitly specified:
  if (
    (isNode || isTest) &&
    (!presetEnvConfig.targets ||
      !(
        typeof presetEnvConfig.targets === "object" &&
        "node" in presetEnvConfig.targets
      ))
  ) {
    presetEnvConfig.targets = {
      // Targets the current process' version of Node. This requires apps be
      // built and deployed on the same version of Node.
      node: "current"
    };
  }

  return {
    sourceType: "unambiguous",
    presets: [
      [require("@babel/preset-env").default, presetEnvConfig],
      [
        require("@babel/preset-react"),
        {
          // Adds component stack to warning messages
          // Adds __self attribute to JSX which React will use for some warnings
          development: isDevelopment || isTest,
          // Will use the native built-in instead of trying to polyfill
          // behavior for any plugins that require one.
          useBuiltIns: true,
          ...options["preset-react"]
        }
      ],
      require("@babel/preset-typescript")
    ],
    plugins: [
      [
        require("./plugins/optimize-hook-destructuring"),
        {
          // only optimize hook functions imported from React/Preact
          lib: true
        }
      ],
      require("@babel/plugin-syntax-dynamic-import"),
      require("./plugins/loadable-plugin"),
      require("@babel/plugin-proposal-class-properties"),
      [
        require("@babel/plugin-proposal-object-rest-spread"),
        {
          useBuiltIns: true
        }
      ],
      [
        require("@babel/plugin-transform-runtime"),
        {
          corejs: 2,
          version: require('@babel/runtime-corejs2/package.json').version,
          helpers: true,
          regenerator: true,
          useESModules: supportsESM && presetEnvConfig.modules !== "commonjs",
          absoluteRuntime: (process.versions as any).pnp
            ? __dirname
            : undefined,
          ...options["transform-runtime"]
        }
      ],
      isProduction && [
        require("babel-plugin-transform-react-remove-prop-types"),
        {
          removeImport: true
        }
      ]
    ].filter(Boolean)
  };
};
