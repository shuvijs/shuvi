import { loadConfig } from "../helpers/loadConfig";
import DevService from "../service";
import { DEV_PUBLIC_PATH } from "../constants";

async function main() {
  const config = await loadConfig();
  config.publicUrl = DEV_PUBLIC_PATH;

  return new DevService({ config }).start();
}

main();
