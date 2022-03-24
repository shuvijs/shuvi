export const getRootAppComponent = App => {
  function RootAppComponent(props) {
    return (
      <div>
        <div>This is getRootAppComponent</div>
        <App {...props} />
      </div>
    );
  }
  if (App.getInitialProps)
    RootAppComponent.getInitialProps = App.getInitialProps;
  return RootAppComponent;
};

export const getAppComponent = UserApp => {
  function AppComponent(props) {
    return (
      <div>
        <div>This is getAppComponent</div>
        <UserApp {...props} />
      </div>
    );
  }
  if (UserApp.getInitialProps)
    AppComponent.getInitialProps = UserApp.getInitialProps;
  return AppComponent;
};
