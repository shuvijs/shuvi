import { dynamic } from "@shuvi/app";

const Hello = dynamic(() => import("../components/hello"));

export default Hello;
