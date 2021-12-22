import React from 'react';
import { user } from './pages/index';
import { useModel } from '@shuvi/services/store';

const getApp = (App: any) => {
  const MyApp = () => {
    const [state] = useModel(user);
    return (
      <div>
        <div>
          <div>this is App.ts</div>
          <div>
            App name:{state.name} id:{state.id}
          </div>
        </div>
        <hr/>
        <App />
      </div>
    );
  };
  return MyApp;
};

export default getApp;
