/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import {
  useModel,
  Provider,
  createContainer,
  useStaticModel,
  useLocalModel
} from '..';

const countModel = {
  name: 'countModel',
  state: {
    value: 1
  },
  reducers: {
    add(state: { value: number }) {
      return {
        ...state,
        value: state.value + 1
      };
    }
  }
};

const App = () => {
  const [state, dispatch] = useModel(countModel);

  return (
    <>
      <div id="state">{state.value}</div>
      <button id="button" type="button" onClick={() => dispatch.add()}>
        add
      </button>
    </>
  );
};

describe('test createGlobalStore', () => {
  let node: HTMLDivElement;
  beforeEach(() => {
    node = document.createElement('div');
    document.body.appendChild(node);
  });

  afterEach(() => {
    document.body.removeChild(node);
    (node as unknown as null) = null;
  });
  it('createGlobalStore should return Provider and useModel', () => {
    const { Provider: _Provider, useModel: _useModel } = createContainer({});

    expect(_Provider).toBeTruthy();
    expect(_useModel).toBeTruthy();
  });

  it('Global Provider and useModel should work', () => {
    act(() => {
      ReactDOM.render(
        <Provider>
          <App />
        </Provider>,
        node
      );
    });

    expect(node.querySelector('#state')?.innerHTML).toEqual('1');
    act(() => {
      node
        .querySelector('#button')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(node.querySelector('#state')?.innerHTML).toEqual('2');
  });

  it('Local Provider and useModel should work', () => {
    const { Provider: LocalProvider, useModel: useLModel } = createContainer(
      {}
    );

    const SubApp = () => {
      const [state, dispatch] = useLModel(countModel);

      return (
        <>
          <div id="state">{state.value}</div>
          <button id="button" type="button" onClick={() => dispatch.add()}>
            add
          </button>
        </>
      );
    };

    act(() => {
      ReactDOM.render(
        <LocalProvider>
          <SubApp />
        </LocalProvider>,
        node
      );
    });

    expect(node.querySelector('#state')?.innerHTML).toEqual('1');
    act(() => {
      node
        .querySelector('#button')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(node.querySelector('#state')?.innerHTML).toEqual('2');
  });

  it('useStaticModel should work', () => {
    let renderTime = 0;
    let currentCount = 0;

    const StaticApp = () => {
      renderTime += 1;

      // @ts-ignore
      const [state, dispatch] = useStaticModel(countModel);

      currentCount = state.value;

      return (
        <>
          <div id="state">{state.value}</div>
          <button id="add" type="button" onClick={() => dispatch.add()}>
            add
          </button>
          <button
            id="updateCount"
            type="button"
            onClick={() => {
              currentCount = state.value;
            }}
          >
            updateCount
          </button>
        </>
      );
    };

    act(() => {
      ReactDOM.render(
        <Provider>
          <StaticApp />
        </Provider>,
        node
      );
    });

    expect(renderTime).toBe(1);
    expect(currentCount).toBe(1);

    act(() => {
      node
        .querySelector('#add')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(renderTime).toBe(1);
    expect(currentCount).toBe(1);

    act(() => {
      node
        .querySelector('#updateCount')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(currentCount).toBe(2);
  });

  it('useLocalModel should work', () => {
    function Container() {
      const [state, dispatch] = useLocalModel(countModel);
      const [state1, dispatch1] = useLocalModel(countModel);

      return (
        <div>
          <div id="state">state: {state.value}</div>
          <div id="state1">state1: {state1.value}</div>
          <button
            id="dispatch-add"
            type="button"
            onClick={() => dispatch.add()}
          >
            dispatch add
          </button>
          <button
            id="dispatch1-add"
            type="button"
            onClick={() => dispatch1.add()}
          >
            dispatch1 add
          </button>
        </div>
      );
    }

    act(() => {
      ReactDOM.render(<Container />, node);
    });

    act(() => {
      node
        .querySelector('#dispatch-add')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(node.querySelector('#state')?.innerHTML).toEqual('state: 2');
    expect(node.querySelector('#state1')?.innerHTML).toEqual('state1: 1');

    act(() => {
      node
        .querySelector('#dispatch1-add')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(node.querySelector('#state')?.innerHTML).toEqual('state: 2');
    expect(node.querySelector('#state1')?.innerHTML).toEqual('state1: 2');
  });
});
