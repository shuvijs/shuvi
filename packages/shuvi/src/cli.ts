#!/usr/bin/env node
import program from "commander";
import spawn from "cross-spawn";
//@ts-ignore
import pkgInfo from "../package.json";

const Commands = ["build", "start"] as const;

type CommandName = typeof Commands[number];

program
  .name("shuvi")
  .version(pkgInfo.version)
  .usage("<cmd> [option]");

program.parse(process.argv);

const [cmd, ...args] = program.args.length ? program.args : ["start"];

if (!Commands.includes(cmd as CommandName)) {
  console.log('Unknown command "' + cmd + '".');
  process.exit(1);
}

const result = spawn.sync("node", [require.resolve("./cmds/" + cmd), ...args], {
  stdio: "inherit",
  cwd: process.env.SHUVI_DIR,
  env: {
    ...process.env,
    NODE_ENV: "development"
  }
});
if (result.signal) {
  if (result.signal === "SIGKILL") {
    console.log(
      "The build failed because the process exited too early. " +
        "This probably means the system ran out of memory or someone called " +
        "`kill -9` on the process."
    );
  } else if (result.signal === "SIGTERM") {
    console.log(
      "The build failed because the process exited too early. " +
        "Someone might have called `kill` or `killall`, or the system could " +
        "be shutting down."
    );
  }
  process.exit(1);
}
process.exit(result.status!);
