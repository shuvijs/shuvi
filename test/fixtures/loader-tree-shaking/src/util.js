export const reexportComponentLoader = (Component, loader) => {
  const newLoader = async ctx => {
    const loaderData = loader ? await loader(ctx) : {};
    return loaderData;
  };
  return {
    Component,
    loader: newLoader
  };
};
