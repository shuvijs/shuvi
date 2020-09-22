export function spyOn(object, method) {
  let original = object[method];
  let spy = jest.fn();

  object[method] = spy;

  return {
    spy,
    destroy() {
      object[method] = original;
    }
  };
}

export function execSteps(steps, router, done) {
  let index = 0,
    cleanedUp = false,
    unsubscribe = () => void 0;

  function cleanup(...args) {
    if (!cleanedUp) {
      cleanedUp = true;
      unsubscribe();
      done(...args);
    }
  }

  function execNextStep(...args) {
    try {
      let nextStep = steps[index++];
      if (!nextStep) throw new Error('Test is missing step ' + index);

      nextStep(...args);

      if (index === steps.length) cleanup();
    } catch (error) {
      cleanup(error);
    }
  }

  if (steps.length) {
    unsubscribe = router.listen(({ action, location }) => {
      execNextStep({
        action: action,
        location: location
      });
    });

    execNextStep({
      action: router.action,
      location: router.current
    });
  } else {
    done();
  }
}
