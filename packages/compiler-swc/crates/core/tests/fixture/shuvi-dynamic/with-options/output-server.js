import { aaa, dynamic, vvv } from '@shuvi/runtime';
const DynamicComponentWithCustomLoading = dynamic(()=>import('../components/hello'), {
    modules: [
        "../components/hello"
    ],
    loading: ()=><p >...</p>
});
const DynamicClientOnlyComponent = dynamic(null, {
    modules: [
        "../components/hello"
    ],
    ssr: false
});
const DynamicClientOnlyComponentWithSuspense = dynamic(()=>import('../components/hello'), {
    modules: [
        "../components/hello"
    ],
    ssr: false,
    suspense: true
});