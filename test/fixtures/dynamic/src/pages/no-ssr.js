import { dynamic } from "@shuvi/app";

const Hello = dynamic(() => import("../components/client-only"), { ssr: false });

export default Hello;
