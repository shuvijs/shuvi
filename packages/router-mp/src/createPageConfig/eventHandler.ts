import {
  MpEvent,
  document,
  createEvent,
  TaroElement,
  container,
  SERVICE_IDENTIFIER,
  IHooks
} from '@tarojs/runtime';

const hooks = container.get<IHooks>(SERVICE_IDENTIFIER.Hooks);

const eventsBatch: {
  [key: string]: any[];
} = {};

// 小程序的事件代理回调函数
export function eventHandler(event: MpEvent) {
  hooks.modifyMpEvent?.(event);

  if (event.currentTarget == null) {
    event.currentTarget = event.target;
  }

  const node = document.getElementById(event.currentTarget.id);
  if (node) {
    const dispatch = () => {
      const e = createEvent(event, node);
      hooks.modifyTaroEvent?.(e, node);
      node.dispatchEvent(e);
    };
    if (typeof hooks.batchedEventUpdates === 'function') {
      const type = event.type;

      if (
        !hooks.isBubbleEvents(type) ||
        !isParentBinded(node, type) ||
        (type === 'touchmove' && !!node.props.catchMove)
      ) {
        // 最上层组件统一 batchUpdate
        hooks.batchedEventUpdates(() => {
          if (eventsBatch[type]) {
            eventsBatch[type].forEach(fn => fn());
            delete eventsBatch[type];
          }
          dispatch();
        });
      } else {
        // 如果上层组件也有绑定同类型的组件，委托给上层组件调用事件回调
        if (!eventsBatch[type]) {
          eventsBatch[type] = [];
        }
        eventsBatch[type].push(dispatch);
      }
    } else {
      dispatch();
    }
  }
}

/**
 * 往上寻找组件树直到 root，寻找是否有祖先组件绑定了同类型的事件
 * @param node 当前组件
 * @param type 事件类型
 */
export function isParentBinded(
  node: TaroElement | null,
  type: string
): boolean {
  let res = false;
  while (node?.parentElement && node.parentElement._path !== 'root') {
    if (node.parentElement.__handlers[type]?.length) {
      res = true;
      break;
    }
    node = node.parentElement;
  }
  return res;
}
