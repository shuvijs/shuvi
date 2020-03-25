import dynamic from "@shuvi/app/dynamic";

const Hello = dynamic(() => import("../../components/hello1"), { ssr: false });

export default Hello;
