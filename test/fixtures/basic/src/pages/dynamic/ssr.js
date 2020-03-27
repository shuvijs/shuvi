import { dynamic } from "@shuvi/app";

const Hello = dynamic(() => import("../../components/hello1"));

export default Hello;
