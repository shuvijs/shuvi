import { dynamic } from "@shuvi/runtime";

const Hello = dynamic(() => import("../components/client-only"), { ssr: false });

export default Hello;
