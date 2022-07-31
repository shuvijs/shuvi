import { dynamic } from '@shuvi/runtime';
const DynamicComponent = dynamic(null, {
    modules: [
        "./components/hello"
    ],
    loading: ()=>null,
    ssr: false
});