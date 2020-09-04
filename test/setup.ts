const OLD_ENVS = { ...process.env };
beforeEach(() => {
  process.env = { ...OLD_ENVS };
});

if (typeof window !== undefined) {
  // @ts-ignore
  global.__BROWSER__ = true;
}
