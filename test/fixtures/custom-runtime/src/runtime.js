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
