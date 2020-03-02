import http from "http";
import { shuvi, ShuviOptions } from "../shuvi";

export async function startServer(
  options: ShuviOptions,
  port?: number,
  hostname?: string
) {
  const app = shuvi(options);
  const srv = http.createServer(app.getRequestHandler());
  await new Promise((resolve, reject) => {
    // This code catches EADDRINUSE error if the port is already in use
    srv.on("error", reject);
    srv.on("listening", async () => {
      await app.ready();
      resolve();
    });
    srv.listen(port, hostname);
  });
  return app;
}
