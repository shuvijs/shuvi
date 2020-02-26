import { loadConfig } from "../config";
import DevService from "../devService";

async function main() {
  const config = await loadConfig();
  return new DevService({ config }).start();
}

main();
