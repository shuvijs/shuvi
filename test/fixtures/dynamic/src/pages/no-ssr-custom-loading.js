import { dynamic } from "@shuvi/app";

const Hello = dynamic(() => import("../components/hello"), {
  ssr: false,
  loading: () => <p>LOADING</p>
});

export default Hello;
