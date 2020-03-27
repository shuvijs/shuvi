import { dynamic } from "@shuvi/app";

const Hello = dynamic(() =>
  import(
    /* webpackChunkName: 'hello-world' */ "../../components/hello-chunkfilename"
  )
);

export default Hello;
