import { dynamic } from "@shuvi/runtime";

const Hello = dynamic(() =>
  import(
    /* webpackChunkName: 'hello-world' */ "../components/hello-chunkfilename"
  )
);

export default Hello;
