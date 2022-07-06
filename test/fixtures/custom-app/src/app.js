export const init = () => {
  console.log('init');
};

export const getAppContext = ctx => {
  return {
    ...ctx,
    testFlag: 1
  };
};

export const getAppComponent = UserApp => {
  function AppComponent(props) {
    return (
      <div>
        <div id="app-component">This is AppComponent</div>
        <UserApp {...props} />
      </div>
    );
  }
  return AppComponent;
};

export const dispose = () => {
  console.log('dispose');
};
