import Component from '../components/Component';
import MyContext from '../context/sharedContext';

export default () => {
  return (
    <MyContext.Provider value={'ModuleA'}>
      <div id="index">
        <Component />
      </div>
    </MyContext.Provider>
  );
};
