import { useState } from 'react';
import { useModel, defineModel, ISelectorParams } from '@shuvi/runtime/model';

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
      return {
        ...state,
        number: state.number + step
      };
    }
  }
});

const user = defineModel(
  {
    name: 'user',
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
    views: {
      d() {
        return this.$dep.dome;
      },
      one() {
        return this.$dep.dome.number;
      },
      double(args: number): string {
        return `state.id=>${this.$state.id}, args=>${args},views.one=>${this.one}`;
      }
    }
  },
  [other, dome]
);

const selector = function (stateAndViews: ISelectorParams<typeof user>) {
  return {
    stateData: stateAndViews.id,
    one: stateAndViews.one(),
    double: stateAndViews.double(3),
    d: stateAndViews.d().number
  };
};

export default function Index() {
  const [index, setIndex] = useState(0);
  const [stateOther, actionsOther] = useModel(other);
  const [stateDome, actionsDome] = useModel(dome);
  const [views, actions] = useModel(user, selector);

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
