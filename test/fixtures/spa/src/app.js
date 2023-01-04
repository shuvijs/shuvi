export const _test_id = 'cutsom-app-mlmc3i27w1';

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
