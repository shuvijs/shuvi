declare module "babel-loader" {
  export default any
}

declare module "terser-webpack-plugin" {
  export default class TerserPlugin {
    constructor(options?: any);

    static isSourceMap(input: any): any;
    static buildSourceMap(inputSourceMap: any): any;
    static buildError(
      err: any,
      file: any,
      sourceMap: any,
      requestShortener?: any
    ): any;
    static buildWarning(
      warning: any,
      file: any,
      sourceMap: any,
      requestShortener?: any,
      warningsFilter?: any
    ): any;

    apply(compiler: any): void;
  }
}
