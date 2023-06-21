const OLD_ENVS = { ...process.env };
process.env.BROWSERSLIST_IGNORE_OLD_DATA = 'true';
beforeEach(() => {
  process.env = { ...OLD_ENVS };
  process.env.BROWSERSLIST_IGNORE_OLD_DATA = 'true';
});
