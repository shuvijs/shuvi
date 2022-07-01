export const getRootAppComponent = App => {
  function RootAppComponent(props) {
    return (
      <div>
        <div id="root-app-component">This is Root AppComponent</div>
        <App {...props} />
      </div>
    );
  }
  return RootAppComponent;
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
