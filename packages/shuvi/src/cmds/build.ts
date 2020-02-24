import program from "commander";
import fse from "fs-extra";
import { AppConfig } from "@shuvi/types/core";
import { loadConfig } from "../helpers/loadConfig";
import formatWebpackMessages from "@shuvi/toolpack/lib/utils/formatWebpackMessages";
import { getCompiler } from "../compiler/compiler";
import { getApp } from "../app";
//@ts-ignore
import pkgInfo from "../../package.json";

program
  .name(pkgInfo.name)
  .usage(`build [options]`)
  .helpOption()
  .option("--public-url <url>", "specify the public network URL")
  .parse(process.argv);

const CliConfigMap: Record<string, string> = {
  publicUrl: "publicUrl"
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
      set(config, CliConfigMap[key], cliOptions[key]);
    }
  });
}

async function main() {
  const config = await loadConfig();
  applyCliOptions(program, config);

  const app = getApp(config);
  await app.build();

  // Remove all content but keep the directory so that
  // if you're in it, you don't end up in Trash
  fse.emptyDirSync(app.paths.buildDir);

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

main();
