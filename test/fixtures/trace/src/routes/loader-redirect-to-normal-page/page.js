export default () => <div id="index">Home Page</div>;

export const loader = ({ redirect }) => {
  return redirect('/normal-page', 301);
};
