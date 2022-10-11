import { Loader } from '@shuvi/runtime';
import { defineModel, useRootModel } from '@shuvi/runtime/model';
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
const count = defineModel({
    name: 'count',
    state: {
        hello: 'count',
        num: 1
    },
    reducers: {
        addCount: (state, payload)=>{
            return {
                ...state,
                num: state.num + payload
            };
        }
    },
    actions: {
        async addCountAsync () {
            this.addCount(this.$dep.base.$state.step);
            await this.$dep.base.addStepAsync();
        }
    }
}, [
    base
]);
export default function Index() {
    const [{ num , hello: helloCount  }, { addCountAsync  }] = useRootModel(count);
    const [{ hello: helloBase , step  }, { addStepAsync  }] = useRootModel(base);
    return __jsx("div", null, __jsx("div", null, "Count: ", helloCount, " ", num, __jsx("button", {
        onClick: ()=>{
            addCountAsync();
        }
    }, "Add Count")), __jsx("div", null, "Base: ", helloBase, __jsx("span", {
        id: "step"
    }, step), __jsx("button", {
        id: "add-async",
        onClick: ()=>{
            addStepAsync();
        }
    }, "Add Step")));
};
