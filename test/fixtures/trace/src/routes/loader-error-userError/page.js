export default () => <div id="index">Home Page</div>;

export const loader = ({ error }) => {
  return error('Manually returns an error', 500);
};
