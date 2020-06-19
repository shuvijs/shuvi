import { createHashHistory } from "./router/history";
import { createClientRenderer } from "./createClientRenderer";

export const renderer = createClientRenderer({
  historyCreator: createHashHistory
});
