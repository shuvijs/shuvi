export default ({ registerPlugin }) => {
  registerPlugin('server:getPageData', {
    name: 'test',
    fn() {
      return {
        foo: 'bar'
      };
    }
  });
};
