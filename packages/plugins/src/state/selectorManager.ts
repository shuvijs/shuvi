const createSelectorManager = () => {
  const selectorModelsMap = new Map<string, Record<string, (s: any) => any>>();
  const addSelector = function (
    name: string,
    selector?: Record<string, (s: any) => any>
  ) {
    selector && selectorModelsMap.set(name, selector);
  };
  const getSelector = function (name: string) {
    return selectorModelsMap.get(name);
  };
  return {
    addSelector,
    getSelector
  };
};

function mapStateBySelect<T = any>(
  s: T,
  selector?: Record<string, (state: T) => any>
) {
  if (!selector) {
    return s;
  }
  let result = {} as Record<string, any>;
  Object.keys(selector).reduce(
    (res, key) => (res[key] = selector[key](s)),
    result
  );
  return result;
}

export { createSelectorManager, mapStateBySelect };
