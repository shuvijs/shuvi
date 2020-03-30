import { dynamic } from "@shuvi/app";

const Hello = dynamic(() => import("../components/hello"), { ssr: false });

export default Hello;
