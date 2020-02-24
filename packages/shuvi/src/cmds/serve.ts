import program from "commander";
import path from "path";
import http from "http";
import { parse } from "url";
import { loadConfig } from "../helpers/loadConfig";
import Service from "../service/devService";
import { serveStatic } from "../helpers/serveStatic";
//@ts-ignore
import pkgInfo from "../../package.json";

program
  .name(pkgInfo.name)
  .usage(`serve [options]`)
  .helpOption()
  .option("--host <host>", "specify host", "0.0.0.0")
  .option("--port <port>", "specify port", "4000")
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

async function main() {
  const config = await loadConfig();
  const service = new Service({ config });
  const server = http.createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    const pathname = parsedUrl.pathname || "/";
    if (pathname.startsWith("/static")) {
      serveStatic(
        req,
        res,
        path.join(config.outputPath, "client", encodeURIComponent(pathname))
      );
      return;
    }

    service.renderPage(req, res);
  });
  server.listen(program.port, program.host, () => {
    console.log(`listening on http://${program.host}:${program.port}`);
  });
}

main();
