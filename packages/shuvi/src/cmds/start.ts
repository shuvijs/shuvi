import { loadConfig } from "../helpers/loadConfig";
import DevService from "../service/devService";

async function main() {
  const config = await loadConfig();
  return new DevService({ config }).start();
}

main();
