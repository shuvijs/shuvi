export const getRootAppComponent = App => {
  function RootAppComponent(props) {
    return (
      <div>
        <div id="root-app">This is getRootAppComponent</div>
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
        <div id="user-app">This is getAppComponent</div>
        <UserApp {...props} />
      </div>
    );
  }

  return AppComponent;
};
