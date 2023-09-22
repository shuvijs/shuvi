export default () => <div id="index">Home Page</div>;

export const loader = () => {
  throw Error('unexpectedError in loader');
};
