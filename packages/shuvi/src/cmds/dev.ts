import program from "commander";
import { loadConfig } from "../config";
import { startServer } from "../helpers/startServer";
//@ts-ignore
import pkgInfo from "../../package.json";

program
  .name(pkgInfo.name)
  .usage(`dev [options]`)
  .helpOption()
  .option("--host <host>", "specify host")
  .option("--port <port>", "specify port")
  .parse(process.argv);

const port = program.port || 3000;
const host = program.host || "localhost";

async function main() {
  const config = await loadConfig();
  try {
    await startServer({ dev: true, config }, port, host);
    console.log(`waiting on http://${host}:${port}`);
  } catch (err) {
    if (err.code === "EADDRINUSE") {
      let errorMessage = `Port ${port} is already in use.`;
      errorMessage += "\nUse `--port` to specify some other port.";
      // tslint:disable-next-line
      console.error(errorMessage);
    } else {
      // tslint:disable-next-line
      console.error(err);
    }
    process.nextTick(() => process.exit(1));
  }
}

main();
