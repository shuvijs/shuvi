import { dynamic } from "@shuvi/runtime";

const Nested2 = dynamic(() => import("./nested2"));

export default () => (
  <div>
    Nested 1
    <Nested2 />
  </div>
);
