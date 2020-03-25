import path from "path";
import { IConfig } from "@shuvi/types";
import { deepmerge } from "@shuvi/utils/lib/deepmerge";
import { loadConfig } from "shuvi/lib/config";
import { getBundler } from "shuvi/src/bundler";
import { Api } from "shuvi/src/api";

async function compile({ api }: { api: Api }) {
  const compiler = getBundler(api);
  return compiler.build();
}

export async function build(dir: string, overrides: Partial<IConfig> = {}) {
  let config = await loadConfig(dir);
  config = deepmerge(config, overrides);

  const api = new Api({ mode: "production", config });
  await api.buildApp();
  const result = await compile({ api });
  expect(result.errors.length).toBeLessThan(1);
}

export async function buildFixture(
  fixture: string,
  overrides: Partial<IConfig> = {}
) {
  test(`Build ${fixture}`, async () => {
    const rootDir = path.resolve(__dirname, "..", "fixtures", fixture);
    await build(rootDir, overrides);
  }, 120000);
}
