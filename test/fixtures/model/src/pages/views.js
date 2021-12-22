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
      return {
        ...state,
        id: state.id + step
      };
    }
  },
  // old Proxy => (getState, args)=> double()
  // new Proxy => (getState, args)=> double()
  views: {
    one(state, rootState){
      return rootState.dome.number;
    },
    double (state, rootState, views, args) {
      console.log('views', state, rootState, views, args);
      // console.log('this', this)
      // console.log('this', views.one)
      return state.id * args + views.one;
    },
  },
};

export const dome = {
  name: 'dome',
  state: {
    number: 666,
  },
  reducers:{

  }
}


export default function Index() {
  const [index, setIndex] = useState(0);
  const [] = useModel(dome);
  const [state, actions] = useModel(user, 2);

  return (
    <div>
      <div>
        state.double: {state.double}
        <hr/>
        User {state.name} {state.id}
      </div>
      <button
        onClick={() => {
          actions.add(2);
        }}
      >
        actions add
      </button>
      <div id="index">Index 112213 {index}</div>
      <button
        onClick={() => {
          setIndex(index + 1);
        }}
      >
        plus one
      </button>
    </div>
  );
}
