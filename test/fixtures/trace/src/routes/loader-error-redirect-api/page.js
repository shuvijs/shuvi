export default () => <div id="index">Home Page</div>;

export const loader = ({ redirect }) => {
  return redirect('/api-success', 301);
};
