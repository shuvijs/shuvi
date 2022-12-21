import { Loader } from '@shuvi/runtime';
import { defineModel, useModel, use } from '@shuvi/runtime/model';

const sleep = (time: number) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(null);
    }, time);
  });

const baseName = 'base';
const base = defineModel({
  state: {
    hello: 'base',
    step: 1
  },
  actions: {
    addStep() {
      this.step++;
    },
    async addStepAsync() {
      await sleep(100);
      this.addStep();
    }
  }
});

const countName = 'count';
const count = defineModel(() => {
  const baseModel = use(baseName, base);
  return {
    state: {
      hello: 'count',
      num: 1
    },
    actions: {
      addCount(payload: number) {
        this.num += payload;
      },
      async addCountAsync() {
        this.addCount(baseModel.step);
        await baseModel.addStepAsync();
      }
    }
  };
});

export default function Index() {
  const countModel = useModel(countName, count);
  const baseModel = useModel(baseName, base);
  return (
    <div>
      <div>
        <div id="num">{countModel.num}</div>
        <span id="step">{baseModel.step}</span>
        <button
          id="add-async"
          onClick={() => {
            baseModel.addStepAsync();
          }}
        >
          Add Step
        </button>
      </div>
    </div>
  );
}

export const loader: Loader = async ctx => {
  const store = ctx.appContext.store;
  const baseStore = store.getModel(baseName, base);
  baseStore.addStep();
  const countStore = store.getModel(countName, count);
  await countStore.addCountAsync();
  return {};
};
