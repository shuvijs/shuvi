export let url = '';

export const init = () => {
  console.log('init');
};

export const appContext = (ctx, { req }) => {
  if (req) {
    ctx.testFlag = 1;
    url = req.url;
    console.log('appContext-----url', url);
  }
};
