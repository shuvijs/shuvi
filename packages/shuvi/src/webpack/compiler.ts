import webpack, {
  MultiCompiler,
  Compiler as WebapckCompiler,
  Configuration
} from "webpack";

class CompilerHelper {
  private _compiler: MultiCompiler | null = null;
  private _configs: Configuration[] = [];

  addConfig(config: Configuration): this {
    if (this._compiler) {
      return this;
    }

    this._configs.push(config);
    return this;
  }

  getCompiler(): MultiCompiler {
    if (!this._compiler) {
      this._compiler = webpack(this._configs);
    }

    return this._compiler!;
  }

  getSubCompiler(name: string): WebapckCompiler | undefined {
    if (!this._compiler) {
      return;
    }

    return this._compiler.compilers.find(compiler => compiler.name === name);
  }
}

export function createCompilerHelper(): CompilerHelper {
  return new CompilerHelper();
}
