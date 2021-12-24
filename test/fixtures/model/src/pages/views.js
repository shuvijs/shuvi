import { useState } from 'react';
import { useModel } from '@shuvi/services/store';

export const user = {
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
  views: {
    one(state, rootState){
      console.log('one computed')
      return rootState.dome.number;
    },
    double (state, rootState, views, args) {
      // console.log('views', state, rootState, views, args);
      // console.log('this', this)
      // console.log('this', views.one)
      // return state.id * args;
      console.log('double computed')
      return state.id * args + views.one;
    },
  },
};


export const other = {
  name: 'other',
  state: {
    other: [
      'other'
    ],
  },
  reducers:{
    add: (state, step) => {
      return {
        ...state,
        other: [...state.other, step]
      };
    }
  }
}

export const dome = {
  name: 'dome',
  state: {
    number: 666,
  },
  reducers:{
    add: (state, step) => {
      // return state;
      return {
        ...state,
        number: state.number + step
      };
    }
  }
}


export default function Index() {
  const [index, setIndex] = useState(0);
  const [stateOther, actionsOther] = useModel(other);
  const [stateDome, actionsDome] = useModel(dome);
  const [views, actions] = useModel(user);

  return (
    <div>
      <div>
        state.double 3: {views.double(3)}
        <hr/>
      </div>
      <button
        onClick={() => {
          actions.add(2);
        }}
      >
        actions user1
      </button>
      <hr/>
      {JSON.stringify(stateDome)}
      <hr/>
      <button
        onClick={() => {
          actionsDome.add(1);
        }}
      >
        actions dome
      </button>
      <hr/>
      {JSON.stringify(stateOther)}
      <hr/>
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
