// Async loading fixture
const loadModule = async name => {
  try {
    const module = await import(
      /* webpackChunkName: "async-modules_[request]" */
      `./async-modules/${name}`
    );
    return module.default;
  } catch (error) {
    console.error(`Failed to load module ${name}:`, error);
    return null;
  }
};

// Sequential async loading
loadModule('module1')
  .then(() => {
    return loadModule('module2');
  })
  .then(() => {
    return loadModule('module3');
  });

// Parallel async loading
Promise.all([
  loadModule('module4'),
  loadModule('module5'),
  loadModule('module6')
]).then(([mod4, mod5, mod6]) => {
  console.log('All modules loaded:', { mod4, mod5, mod6 });
});
