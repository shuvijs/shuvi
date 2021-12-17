import { useState } from 'react';
import { useModel } from '@shuvi/services/store';

export const user = {
  name: 'user',
  state: {
    id: 1,
    name: 'haha'
  },
  reducers: {
    add: (state: any, step: any) => {
      return {
        ...state,
        id: state.id + step
      };
    }
  }
};

export default function Index() {
  const [index, setIndex] = useState(0);
  const [state, actions] = useModel(user);
  return (
    <div>
      <div>
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
        plus one sdfsdfsf
      </button>
    </div>
  );
}
