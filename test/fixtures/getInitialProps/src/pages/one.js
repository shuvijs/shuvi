import { Link } from '@shuvi/router-react';

let globalTime = 0;

const One = ({ time }) => (
  <div data-test-id="one">
    <div data-test-id="name">Page One</div>
    <div data-test-id="time">{time}</div>
    <Link to="/two">Goto Page Two</Link>
  </div>
);

One.getInitialProps = async ({ isServer }) => {
  await new Promise(resolve => setTimeout(() => resolve(), 300));

  if (!isServer) {
    globalTime++;
  }

  return {
    time: globalTime
  };
};

export default One;
