import path from "path";
import program from "commander";
import fse from "fs-extra";
import { App } from "@shuvi/types";
import formatWebpackMessages from "@shuvi/toolpack/lib/utils/formatWebpackMessages";
import { getCompiler } from "../compiler/compiler";
import { getApp } from "../app";
import { getDocumentService } from "../documentService";
import { BUILD_CLIENT_DIR } from "../constants";
import { loadConfig, AppConfig } from "../config";
//@ts-ignore
import pkgInfo from "../../package.json";

program
  .name(pkgInfo.name)
  .usage(`build [options]`)
  .helpOption()
  .option("--public-url <url>", "specify the public network URL")
  .option("--target <target>", "specify the app output target. eg: spa")
  .option(
    "--router-history <history>",
    "specify the hisotry type. 'browser' or 'hash'"
  )
  .parse(process.argv);

interface CliOptions {
  publicUrl?: string;
  target?: "spa";
}

const CliConfigMap: Record<string, string | ((config: any) => void)> = {
  publicUrl: "publicUrl",
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

function applyCliOptions(cliOptions: Record<string, any>, config: AppConfig) {
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

async function compile({ app }: { app: App }) {
  const compiler = getCompiler(app);
  const result = await compiler.run();
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
  app,
  pathname,
  filename
}: {
  app: App;
  pathname: string;
  filename: string;
}) {
  const html = await getDocumentService({ app }).renderDocument({
    url: pathname
  });
  await fse.writeFile(
    path.resolve(app.paths.buildDir, BUILD_CLIENT_DIR, filename),
    html
  );
}

async function main() {
  const cliOpts = program as CliOptions;
  const config = await loadConfig();
  applyCliOptions(cliOpts, config);

  const app = getApp(config);
  await app.build();

  // Remove all content but keep the directory so that
  // if you're in it, you don't end up in Trash
  fse.emptyDirSync(app.paths.buildDir);

  await compile({ app });

  if (cliOpts.target === "spa") {
    await buildHtml({ app, pathname: "/", filename: "index.html" });
  }
}

main();
