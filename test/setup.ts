const OLD_ENVS = { ...process.env };

beforeEach(() => {
  process.env = { ...OLD_ENVS };
});
