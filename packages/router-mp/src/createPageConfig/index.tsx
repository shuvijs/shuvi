import * as React from 'react';
import {
  Current,
  document,
  Instance,
  PageInstance,
  TaroRootElement,
  eventCenter,
  container,
  SERVICE_IDENTIFIER,
  requestAnimationFrame,
  IHooks
} from '@tarojs/runtime';
import type { PageConfig } from '@tarojs/taro';
import { isFunction } from '@shuvi/utils';
import invariant from '@shuvi/utils/lib/invariant';
import { eventHandler } from './eventHandler';

import { getGlobalRoutes, addGlobalRoutes } from '../globalRoutes';
import { MpRouter } from '../mpRouter';

export interface MpInstance {
  config: PageConfig;
  setData: (data: unknown, cb: () => void) => void;
  route?: string;
  __route__: string;
  $taroParams?: Record<string, unknown>;
  $taroPath: string;
  __data__: any;
  data: any;
  selectComponent: (selector: string) => any;
}

const instances = new Map<string, Instance>();
const hooks = container.get<IHooks>(SERVICE_IDENTIFIER.Hooks);

export function safeExecute(
  path: string,
  lifecycle: keyof PageInstance,
  ...args: unknown[]
) {
  const instance = instances.get(path);

  if (instance == null) {
    return;
  }

  const func = hooks.getLifecycle(instance, lifecycle);

  if (Array.isArray(func)) {
    const res = func.map(fn => fn.apply(instance, args));
    return res[0];
  }

  if (!isFunction(func)) {
    return;
  }

  return func.apply(instance, args);
}

export function createPageConfig(
  component: any,
  pageName: string,
  data?: Record<string, unknown>,
  pageConfig?: PageConfig
) {
  const id = pageName;
  // 小程序 Page 构造器是一个傲娇小公主，不能把复杂的对象挂载到参数上
  let pageElement: TaroRootElement | null = null;

  let unmounting = false;
  let prepareMountList: (() => void)[] = [];
  const config: PageInstance = {
    onLoad(this: MpInstance, options: any, cb?: (...args: any[]) => void) {
      Current.page = this as any;
      this.config = pageConfig || {};
      options.$taroTimestamp = Date.now();

      // this.$taroPath 是页面唯一标识，不可变，因此页面参数 options 也不可变
      this.$taroPath = getPath(id, options);
      // this.$taroParams 作为暴露给开发者的页面参数对象，可以被随意修改
      if (this.$taroParams == null) {
        this.$taroParams = Object.assign({}, options);
      }

      const router = this.$taroPath;
      Current.router = {
        params: this.$taroParams!,
        path: addLeadingSlash(router),
        onReady: getOnReadyEventKey(id),
        onShow: getOnShowEventKey(id),
        onHide: getOnHideEventKey(id)
      };

      addGlobalRoutes(pageName!, component);

      function MpRouterWrapper() {
        return (
          <MpRouter
            initialEntries={[pageName!]}
            routes={getGlobalRoutes()}
          ></MpRouter>
        );
      }

      component = MpRouterWrapper;

      const mount = () => {
        Current.app!.mount!(component, this.$taroPath, () => {
          pageElement = document.getElementById<TaroRootElement>(
            this.$taroPath
          );
          invariant(pageElement !== null, '没有找到页面实例。');
          safeExecute(this.$taroPath, 'onLoad', this.$taroParams);
          pageElement.ctx = this;
          pageElement.performUpdate(true, cb);
        });
      };
      if (unmounting) {
        prepareMountList.push(mount);
      } else {
        mount();
      }
    },
    onReady() {
      requestAnimationFrame(() => {
        eventCenter.trigger(getOnReadyEventKey(id));
      });
      // @ts-ignore
      safeExecute(this.$taroPath, 'onReady');
      if (this.onReady) {
        (this.onReady as { called?: boolean }).called = true;
      }
    },
    onUnload(this: MpInstance) {
      unmounting = true;
      Current.app!.unmount!(this.$taroPath, () => {
        unmounting = false;
        instances.delete(this.$taroPath);
        if (pageElement) {
          pageElement.ctx = null;
        }
        if (prepareMountList.length) {
          prepareMountList.forEach(fn => fn());
          prepareMountList = [];
        }
      });
    },
    onShow(this: MpInstance) {
      Current.page = this as any;
      this.config = pageConfig || {};
      const router = this.$taroPath;
      Current.router = {
        params: this.$taroParams!,
        path: addLeadingSlash(router),
        onReady: getOnReadyEventKey(id),
        onShow: getOnShowEventKey(id),
        onHide: getOnHideEventKey(id)
      };

      requestAnimationFrame(() => {
        eventCenter.trigger(getOnShowEventKey(id));
      });

      safeExecute(this.$taroPath, 'onShow');
    },
    onHide(this: MpInstance) {
      Current.page = null;
      Current.router = null;
      safeExecute(this.$taroPath, 'onHide');
      eventCenter.trigger(getOnHideEventKey(id));
    },
    onPullDownRefresh(this: MpInstance) {
      return safeExecute(this.$taroPath, 'onPullDownRefresh');
    },
    onReachBottom(this: MpInstance) {
      return safeExecute(this.$taroPath, 'onReachBottom');
    },
    onPageScroll(this: MpInstance, options) {
      return safeExecute(this.$taroPath, 'onPageScroll', options);
    },
    onResize(this: MpInstance, options) {
      return safeExecute(this.$taroPath, 'onResize', options);
    },
    onTabItemTap(this: MpInstance, options) {
      return safeExecute(this.$taroPath, 'onTabItemTap', options);
    },
    onTitleClick(this: MpInstance) {
      return safeExecute(this.$taroPath, 'onTitleClick');
    },
    onOptionMenuClick(this: MpInstance) {
      return safeExecute(this.$taroPath, 'onOptionMenuClick');
    },
    onPopMenuClick(this: MpInstance) {
      return safeExecute(this.$taroPath, 'onPopMenuClick');
    },
    onPullIntercept(this: MpInstance) {
      return safeExecute(this.$taroPath, 'onPullIntercept');
    },
    onAddToFavorites(this: MpInstance) {
      return safeExecute(this.$taroPath, 'onAddToFavorites');
    }
  };

  // onShareAppMessage 和 onShareTimeline 一样，会影响小程序右上方按钮的选项，因此不能默认注册。
  if (
    component.onShareAppMessage ||
    component.prototype?.onShareAppMessage ||
    component.enableShareAppMessage
  ) {
    config.onShareAppMessage = function (this: MpInstance, options) {
      const target = options?.target;
      if (target != null) {
        const id = target.id;
        const element = document.getElementById(id);
        if (element != null) {
          options.target!.dataset = element.dataset;
        }
      }
      return safeExecute(this.$taroPath, 'onShareAppMessage', options);
    };
  }
  if (
    component.onShareTimeline ||
    component.prototype?.onShareTimeline ||
    component.enableShareTimeline
  ) {
    config.onShareTimeline = function (this: MpInstance) {
      return safeExecute(this.$taroPath, 'onShareTimeline');
    };
  }

  config.eh = eventHandler;

  if (typeof data !== undefined) {
    config.data = data;
  }

  return config;
}

function getPath(id: string, options?: Record<string, unknown>): string {
  let path = id;
  path = id + JSON.stringify(options);
  return path;
}

function addLeadingSlash(path?: string): string {
  if (path == null) {
    return '';
  }
  return path.charAt(0) === '/' ? path : '/' + path;
}

function getOnReadyEventKey(path: string) {
  return path + '.' + 'onReady';
}

function getOnShowEventKey(path: string) {
  return path + '.' + 'onShow';
}

function getOnHideEventKey(path: string) {
  return path + '.' + 'onHide';
}
