const { createPlugin } = require('@shuvi/runtime-core');

module.exports = (option) => createPlugin({
  appComponent: App => {
    const newApp = () => (
      <div>
        <div>This is getAppComponent {option}</div>
        <App />
      </div>
    )
    return newApp
  },
  rootAppComponent: App => {
    const newApp = () => (
      <div>
        <div>This is getRootAppComponent</div>
        <App />
      </div>
    )
    return newApp
  }
})
