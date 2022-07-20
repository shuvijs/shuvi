import { dynamic } from '@shuvi/runtime';
const DynamicComponent1 = dynamic(()=>import('../components/hello1'), {
    webpack: ()=>[
            require.resolveWeak("../components/hello1")
        ]
});
const DynamicComponent2 = dynamic(()=>import('../components/hello2'), {
    webpack: ()=>[
            require.resolveWeak("../components/hello2")
        ]
});