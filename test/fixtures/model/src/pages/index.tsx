import { useModel, defineModel } from '@shuvi/services/store';

const sleep = (time: number) => new Promise((resolve) => {
  setTimeout(() => {
    resolve(null)
  }, time)
})

const core = defineModel({
  name: 'core',
  state: {
    hello: 'core',
    step: 1
  },
  reducers: {
    addStep: (state) => {
      return {
        ...state,
        step: state.step + 1
      }
    }
  },
  effects: {
    addStepAsync: async (payload, state, dispatch) => {
      await sleep(1000)
      dispatch.addStep()
    }
  }
})

const base = defineModel({
  name: 'base',
  state: {
    hello: 'base',
    step: 1
  },
  reducers: {
    addStep: (state) => {
      return {
        ...state,
        step: state.step + 1
      }
    }
  },
  effects: {
    addStepAsync: async (payload, state, dispatch) => {
      await sleep(1000)
      dispatch.addStep()
    }
  }
}, { core })


const count = defineModel({
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
      }
    }
  },
  effects: {
    addCountAsync: async (payload, state, dispatch, rootState, rootDispatch) => {
      console.warn('addCountAsyncState', state)
      dispatch.addCount(rootState.base.step)
      await rootDispatch.base.addStepAsync()
    }
  }
}, { base })

export default function Index() {
  //@ts-ignore
  const [{ num, hello: helloCount }, { addCountAsync }] = useModel(count);
  // @ts-ignore
  const [{ hello: helloBase, step }, { addStepAsync }] = useModel(base)
  return (
    <div>
      <div>
        Count: {helloCount} {num}
        <button
          onClick={() => {
            // @ts-ignore
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
            // @ts-ignore
            addStepAsync();
          }}
        >
          Add Step
        </button>
      </div>
    </div>
  );
}
