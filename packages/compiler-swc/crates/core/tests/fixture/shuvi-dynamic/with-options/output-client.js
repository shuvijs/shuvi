import { aaa, dynamic, vvv } from '@shuvi/runtime';
const DynamicComponentWithCustomLoading = dynamic(()=>import('../components/hello'), {
    webpack: ()=>[
            require.resolveWeak("../components/hello")
        ],
    loading: ()=><p >...</p>
});
const DynamicClientOnlyComponent = dynamic(()=>import('../components/hello'), {
    webpack: ()=>[
            require.resolveWeak("../components/hello")
        ],
    ssr: false
});
const DynamicClientOnlyComponentWithSuspense = dynamic(()=>import('../components/hello'), {
    webpack: ()=>[
            require.resolveWeak("../components/hello")
        ],
    ssr: false,
    suspense: true
});