import path from "path";
import program from "commander";
import fse from "fs-extra";
import { IConfig } from "@shuvi/types";
import formatWebpackMessages from "@shuvi/toolpack/lib/utils/formatWebpackMessages";
import { Api } from "../api/api";
import { getBundler } from "../bundler/bundler";
import { Renderer } from "../renderer";
import { BUILD_CLIENT_DIR } from "../constants";
import { loadConfig } from "../config";
//@ts-ignore
import pkgInfo from "../../package.json";

interface CliOptions {
  assetPrefix?: string;
  target?: "spa";
}

const CliConfigMap: Record<string, string | ((config: any) => void)> = {
  assetPrefix: "assetPrefix",
  routerHistory: "router.history",
  target(config) {
    config.ssr = false;
  }
};

function set(obj: any, path: string, value: any) {
  const segments = path.split(".");
  const final = segments.pop()!;
  for (var i = 0; i < segments.length; i++) {
    if (!obj) {
      return;
    }
    obj = obj[segments[i]];
  }
  obj[final] = value;
}

function applyCliOptions(cliOptions: Record<string, any>, config: IConfig) {
  Object.keys(CliConfigMap).forEach(key => {
    if (typeof program[key] !== "undefined") {
      const value = CliConfigMap[key];
      if (typeof value === "function") {
        value(config);
      } else {
        set(config, value, cliOptions[key]);
      }
    }
  });
}

async function bundle({ api }: { api: Api }) {
  const bundler = getBundler(api);
  const result = await bundler.build();
  const messages = formatWebpackMessages(result);

  // If errors exist, only show errors.
  if (messages.errors.length) {
    // Only keep the first error. Others are often indicative
    // of the same problem, but confuse the reader with noise.
    if (messages.errors.length > 1) {
      messages.errors.length = 1;
    }
    console.log("Failed to compile.\n");
    console.log(messages.errors.join("\n\n"));
    return;
  }

  // Show warnings if no errors were found.
  if (messages.warnings.length) {
    console.log("Compiled with warnings.\n");
    console.log(messages.warnings.join("\n\n"));
  }
  console.log("Compiled successfully!");
}

async function buildHtml({
  api,
  pathname,
  filename
}: {
  api: Api;
  pathname: string;
  filename: string;
}) {
  const html = await new Renderer({ api }).renderDocument({
    url: pathname
  });
  await fse.writeFile(
    path.resolve(api.paths.buildDir, BUILD_CLIENT_DIR, filename),
    html
  );
}

export default async function main(argv: string[]) {
  program
    .name(pkgInfo.name)
    .usage(`build [options]`)
    .helpOption()
    .option(
      "--asset-prefix <prefix>",
      "specify the asset prefix. eg: https://some.cdn.com"
    )
    .option("--target <target>", "specify the app output target. eg: spa")
    .option(
      "--router-history <history>",
      "specify the hisotry type. 'browser' or 'hash'"
    )
    .parse(argv);

  const cliOpts = program as CliOptions;
  const config = await loadConfig();
  applyCliOptions(cliOpts, config);

  const api = new Api({ mode: "production", config });
  await api.buildApp();

  // Remove all content but keep the directory so that
  // if you're in it, you don't end up in Trash
  fse.emptyDirSync(api.paths.buildDir);

  await bundle({ api });

  if (cliOpts.target === "spa") {
    await buildHtml({ api, pathname: "/", filename: "index.html" });
  }
}
