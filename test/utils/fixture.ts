import path from "path";
import { IConfig } from "@shuvi/types";
import { deepmerge } from "@shuvi/utils/lib/deepmerge";
import { loadConfig } from "shuvi/lib/config";
import { getBundler } from "shuvi/lib/bundler";
import { Api } from "shuvi/lib/api";

async function compile({ api }: { api: Api }) {
  const compiler = getBundler(api);
  return compiler.build();
}

async function build(config: IConfig) {
  const api = new Api({ mode: "production", config });
  await api.buildApp();
  const result = await compile({ api });
  expect(result.errors.length).toBeLessThan(1);
}

export async function loadFixture(
  fixture: string,
  overrides: Partial<IConfig> = {}
): Promise<IConfig> {
  const rootDir = path.resolve(__dirname, "..", "fixtures", fixture);
  const config = await loadConfig(rootDir);

  return deepmerge(config, overrides);
}

export async function buildFixture(
  fixture: string,
  overrides: Partial<IConfig> = {}
) {
  test(`Build ${fixture}`, async () => {
    const config = await loadFixture(fixture, overrides);
    await build(config);
  }, 120000);
}
