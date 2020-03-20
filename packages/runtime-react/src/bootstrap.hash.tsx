import { createHashHistory } from "./router/history";
import { createBootstrap } from "./create-bootstrap";

export const bootstrap = createBootstrap({
  historyCreator: createHashHistory
});
