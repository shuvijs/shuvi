import program from "commander";
import { loadConfig } from "../config";
import { startServer } from "../helpers/startServer";
//@ts-ignore
import pkgInfo from "../../package.json";

program
  .name(pkgInfo.name)
  .usage(`serve [options]`)
  .helpOption()
  .option("--host <host>", "specify host")
  .option("--port <port>", "specify port")
  .parse(process.argv);

const port = program.port || 3000;
const host = program.host || "localhost";

async function main() {
  const config = await loadConfig();
  try {
    await startServer({ config }, port, host);
    console.log(`Ready on http://${host}:${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
