import { dynamic } from "@shuvi/app";

const DynamicComponent = dynamic(() => import("../components/nested1"));

export default DynamicComponent;
