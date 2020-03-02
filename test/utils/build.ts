import path from "path";
import { App } from "@shuvi/types";
import { ShuviConfig, loadConfig } from "shuvi/lib/config";
import { merge } from "@shuvi/utils/lib/merge";
import { getCompiler } from "../../packages/shuvi/src/compiler/compiler";
import { getApp } from "../../packages/shuvi/src/app";

async function compile({ app }: { app: App }) {
  const compiler = getCompiler(app);
  return compiler.run();
}

export async function build(dir: string, overrides: Partial<ShuviConfig> = {}) {
  let config = await loadConfig(dir);
  config = merge(config, overrides);

  const app = getApp(config);
  await app.build();
  const result = await compile({ app });

  expect(result.errors.length).toBeLessThan(1);
}

export async function buildFixture(
  fixture: string,
  overrides: Partial<ShuviConfig> = {}
) {
  test(`Build ${fixture}`, async () => {
    const rootDir = path.resolve(__dirname, "..", "fixtures", fixture);
    await build(rootDir, overrides);
  }, 120000);
}
