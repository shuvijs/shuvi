export default (router, done) => {
  expect(router.current).toMatchObject({
    pathname: '/'
  });

  router.push('/home');

  let transitionHookWasCalled = false;
  let unblock = router.block(() => {
    transitionHookWasCalled = true;
  });

  // These timeouts are a hack to allow for the time it takes
  // for histories to reflect the change in the URL. Normally
  // we could just listen and avoid the waiting time. But this
  // test is designed to test what happens when we don't listen(),
  // so that's not an option here.

  // Allow some time for router to detect the Push.
  setTimeout(() => {
    router.back();

    // Allow some time for router to detect the POP.
    setTimeout(() => {
      expect(transitionHookWasCalled).toBe(true);
      unblock();

      done();
    }, 100);
  }, 10);
};
