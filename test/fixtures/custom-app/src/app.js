export const init = () => {
  console.log('init');
};

export const appContext = ctx => {
  return {
    ...ctx,
    testFlag: 1
  };
};

export const appComponent = UserApp => {
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
