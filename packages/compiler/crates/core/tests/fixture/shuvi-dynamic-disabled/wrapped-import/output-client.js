import { dynamic } from '@shuvi/runtime';
const DynamicComponent = dynamic(()=>handleImport(import('./components/hello')), {
    webpack: ()=>[
            require.resolve("./components/hello")
        ],
    loading: ()=>null,
    ssr: false
});