/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { useModel, Provider } from '..';
import { model } from '../news'
const countModel = model('countModel').define({
  state: {
    value: 1,
    value1: 1
  },
  actions: {
    addValue(state) {
      return {
        ...state,
        value: state.value + 1
      };
    },
    addValue1(state) {
      return {
        ...state,
        value1: state.value1 + 1
      };
    }
  }
});

describe('test batch', () => {
  let node: HTMLDivElement;
  beforeEach(() => {
    node = document.createElement('div');
    document.body.appendChild(node);
  });

  afterEach(() => {
    document.body.removeChild(node);
    (node as unknown as null) = null;
  });
  test('once store change, update should batch in one render', () => {
    let renderCount = 0;

    function SubApp() {
      renderCount += 1;
      //@ts-ignore
      const [{ value1 }, { addValue1 }] = useModel(countModel);

      return (
        <>
          <div id="addValue1">value1:{value1}</div>
          <div
            id="button1"
            onClick={() => {
              addValue1();
            }}
          >
            addValue1
          </div>
        </>
      );
    }

    function App() {
      //@ts-ignore
      const [{ value }, { addValue }] = useModel(countModel);
      return (
        <div>
          <div id="addValue">value:{value}</div>
          <div id="button" onClick={() => addValue()}>
            addValue
          </div>
          <SubApp />
        </div>
      );
    }

    act(() => {
      ReactDOM.render(
        <Provider>
          <App />
        </Provider>,
        node
      );
    });

    expect(renderCount).toBe(1);

    act(() => {
      node
        .querySelector('#button')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(renderCount).toBe(2);
    expect(node.querySelector('#addValue')?.innerHTML).toEqual('value:2');

    act(() => {
      node
        .querySelector('#button1')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(renderCount).toBe(3);
    expect(node.querySelector('#addValue1')?.innerHTML).toEqual('value1:2');
  });

  // todo test with views done
  // test('state selector should reduce the rerender times', () => {
  //   let parentRenderCount = 0;
  //   let childRenderCount = 0;
  //
  //   function SubApp() {
  //     childRenderCount += 1;
  //
  //     const [{ value1 }, { addValue1 }] = useModel(
  //       countModel,
  //       (state: { value1: any }) => ({
  //         value1: state.value1
  //       })
  //     );
  //
  //     return (
  //       <>
  //         <div>value1:{value1}</div>
  //         <div
  //           onClick={() => {
  //             addValue1();
  //           }}
  //         >
  //           addValue1
  //         </div>
  //       </>
  //     );
  //   }
  //
  //   function App() {
  //     parentRenderCount += 1;
  //     const [{ value }, { addValue }] = useModel(
  //       countModel,
  //       (state: { value: any }) => ({
  //         value: state.value
  //       })
  //     );
  //
  //     return (
  //       <div>
  //         <div>value:{value}</div>
  //         <div onClick={() => addValue()}>addValue</div>
  //         <SubApp />
  //       </div>
  //     );
  //   }
  //
  //   const result = render(
  //     <Provider>
  //       <App />
  //     </Provider>
  //   );
  //
  //   expect(parentRenderCount).toBe(1);
  //   expect(childRenderCount).toBe(1);
  //
  //   fireEvent.click(result.getByText('addValue'));
  //   expect(parentRenderCount).toBe(2);
  //   expect(childRenderCount).toBe(2);
  //
  //   fireEvent.click(result.getByText('addValue1'));
  //   expect(parentRenderCount).toBe(2);
  //   expect(childRenderCount).toBe(3);
  //
  //   expect(result.getByText('value:2')).toBeInTheDocument();
  //   expect(result.getByText('value1:2')).toBeInTheDocument();
  // });
});
