export interface Paths {
  projectDir: string;
  outputDir: string;
  srcDir: string;
  pagesDir: string;
  pageDocument: string;
  // tmpDir: string;
}

export interface ShuviConfig {
  cwd: string;
  outputPath: string;
  publicPath: string;
}

export interface Shuvi {
  config: Omit<ShuviConfig, "cwd" | "outputPath">;
  paths: Paths;
}
