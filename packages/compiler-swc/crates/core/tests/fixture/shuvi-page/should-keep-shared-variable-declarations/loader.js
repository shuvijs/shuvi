import { defineModel } from '@shuvi/runtime/model';
const sleep = (time)=>new Promise((resolve)=>{
        setTimeout(()=>{
            resolve(null);
        }, time);
    });
const core = defineModel({
    name: 'core',
    state: {
        hello: 'core',
        step: 1
    },
    reducers: {
        addStep: function(state) {
            return {
                ...state,
                step: state.step + 1
            };
        }
    },
    actions: {
        async addStepAsync () {
            await sleep(100);
            this.addStep();
        }
    }
});
const base = defineModel({
    name: 'base',
    state: {
        hello: 'base',
        step: 1
    },
    reducers: {
        addStep: (state)=>{
            return {
                ...state,
                step: state.step + 1
            };
        }
    },
    actions: {
        async addStepAsync () {
            await sleep(100);
            this.addStep();
        }
    }
}, [
    core
]);
export const loader = async (ctx)=>{
    const store = ctx.appContext.store;
    const baseStore = store.getModel(base);
    await baseStore.addStepAsync();
    return {};
};