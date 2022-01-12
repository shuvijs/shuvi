import { dynamic } from "@shuvi/runtime";

const Hello = dynamic(() => import("../components/hello"), {
  ssr: false,
  loading: () => <p>LOADING</p>
});

export default Hello;
