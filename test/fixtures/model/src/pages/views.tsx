import { useState } from 'react';
import { useModel, defineModel } from '@shuvi/services/store';

const error = defineModel({
  name: 'error',
  state: {},
  reducers: {}
});

const other = defineModel({
  name: 'other',
  state: {
    other: ['other']
  },
  reducers: {
    add: (state, step) => {
      return {
        ...state,
        other: [...state.other, step]
      };
    }
  }
});

const dome = defineModel({
  name: 'dome',
  state: {
    number: 666
  },
  reducers: {
    add: (state, step) => {
      // return state;
      return {
        ...state,
        number: state.number + step
      };
    }
  }
});

const user = defineModel(
  {
    name: 'user1',
    state: {
      id: 1,
      name: 'haha'
    },
    reducers: {
      add: (state, step) => {
        // return state;
        return {
          ...state,
          id: state.id + step
        };
      }
    },
    effects: {
      addCountAsync: async (
        payload,
        state,
        dispatch,
        rootState,
        rootDispatch
      ) => {
        console.warn('addCountAsyncState', state);
        dispatch.addCount(rootState.other.other[0]);
        await rootDispatch.base.addStepAsync();
      }
    },
    views: {
      d: (state, rootState, views, args) => {
        console.log(state.id);
        const a = rootState.other;
        console.log(rootState.dome.number);
        console.log(a.other[0]);
        console.log('d computed');
        return rootState.dome;
      },
      one: (state, rootState, views, args) => {
        console.log('one computed', rootState);
        console.log(state, rootState, views, args);
        return rootState.dome.number;
      },
      double: (state, rootState, views, args) => {
        // console.log('views', state, rootState, views, args);
        // console.log('this', this)
        // console.log('this', views.one)
        // return state.id * args;
        console.log('double computed');
        return `state.id=>${state.id}, args=>${args},views.one=>${views.one}`;
      }
    }
  },
  { other, dome }
);

export default function Index() {
  const [index, setIndex] = useState(0);
  const [stateOther, actionsOther] = useModel(other);
  const [stateDome, actionsDome] = useModel(dome);
  const [views, actions] = useModel(user, function (state, views) {
    return {
      stateData: state.id,
      one: views.one(),
      double: views.double(3),
      d: views.d().number
    };
  });

  return (
    <div>
      <div>
        state.double 3: {views.double}
        {views.one}
        {views.d}
        <hr />
      </div>
      <button
        onClick={() => {
          actions.add(2);
        }}
      >
        actions user1
      </button>
      <hr />
      {JSON.stringify(stateDome)}
      <hr />
      <button
        onClick={() => {
          actionsDome.add(1);
        }}
      >
        actions dome
      </button>
      <hr />
      {JSON.stringify(stateOther)}
      <hr />
      <button
        onClick={() => {
          actionsOther.add(1);
        }}
      >
        actions other
      </button>
      <div id="index">Index: {index}</div>
      <button
        onClick={() => {
          setIndex(index + 1);
        }}
      >
        trigger useState
      </button>
    </div>
  );
}
