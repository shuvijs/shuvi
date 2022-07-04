import { defineModel, useRootModel } from '@shuvi/runtime/model';

const sleep = (time: number) =>
  new Promise(resolve => {
    setTimeout(() => {
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
    addStep: function (state) {
      return {
        ...state,
        step: state.step + 1
      };
    }
  },
  actions: {
    async addStepAsync() {
      await sleep(1000);
      this.addStep();
    }
  }
});

const base = defineModel(
  {
    name: 'base',
    state: {
      hello: 'base',
      step: 1
    },
    reducers: {
      addStep: state => {
        return {
          ...state,
          step: state.step + 1
        };
      }
    },
    actions: {
      async addStepAsync() {
        await sleep(1000);
        this.addStep();
      }
    }
  },
  [core]
);

const count = defineModel(
  {
    name: 'count',
    state: {
      hello: 'count',
      num: 1
    },
    reducers: {
      addCount: (state, payload: number) => {
        return {
          ...state,
          num: state.num + payload
        };
      }
    },
    actions: {
      async addCountAsync() {
        this.addCount(this.$dep.base.$state.step);
        await this.$dep.base.addStepAsync();
      }
    }
  },
  [base]
);

export default function Index() {
  const [{ num, hello: helloCount }, { addCountAsync }] = useRootModel(count);
  const [{ hello: helloBase, step }, { addStepAsync }] = useRootModel(base);
  return (
    <div>
      <div>
        Count: {helloCount} {num}
        <button
          onClick={() => {
            addCountAsync();
          }}
        >
          Add Count
        </button>
      </div>

      <div>
        Base: {helloBase} {step}
        <button
          onClick={() => {
            addStepAsync();
          }}
        >
          Add Step
        </button>
      </div>
    </div>
  );
}

Index.getInitialProps = async function (ctx: any) {
  const storeManager = ctx.appContext.storeManager;
  const baseStore = storeManager.get(base);
  await baseStore.addStepAsync();
  console.log(baseStore.$state);
  return {};
};
