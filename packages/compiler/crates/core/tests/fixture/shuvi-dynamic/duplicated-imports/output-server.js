import { dynamic } from '@shuvi/runtime';
const DynamicComponent1 = dynamic(()=>import('../components/hello1'), {
    modules: [
        "../components/hello1"
    ]
});
const DynamicComponent2 = dynamic(()=>import('../components/hello2'), {
    modules: [
        "../components/hello2"
    ]
});