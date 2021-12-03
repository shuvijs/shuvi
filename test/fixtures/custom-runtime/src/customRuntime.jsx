import { IRuntimeModule } from '@shuvi/runtime-core';

export const getAppComponent = App => {
  const newApp = () => (
    <div>
      <div>This is getAppComponent</div>
      <App />
    </div>
  )
  return newApp
}

export const getRootAppComponent = App => {
  const newApp = () => (
    <div>
      <div>This is getRootAppComponent</div>
      <App />
    </div>
  )
  return newApp
}
