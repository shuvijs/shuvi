import { useState } from 'react';
import { useModel, model } from '@shuvi/services/model'

export const user = model('user').define({
  state: {
    id: 1,
    name: 'haha'
  },
  actions: {
    add: (state, step) => {
      return {
        ...state,
        id: state.id + step
      }
    }
  }
})

export default function Index() {
  const [index, setIndex] = useState(0);
  const [state, actions] = useModel(user);
  return (
    <div>
      <div>User {state.name} {state.id}</div>
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
