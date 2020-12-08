import { Link } from '@shuvi/router-react';

let globalTime = 0;

const Two = ({ time }) => (
  <div data-test-id="two">
    <div data-test-id="name">Page Two</div>
    <div data-test-id="time">{time}</div>
    <Link to="/one">Goto Page One</Link>
  </div>
);

Two.getInitialProps = async ({ isServer }) => {
  await new Promise(resolve => setTimeout(() => resolve(), 300));

  if (!isServer) {
    globalTime++;
  }

  return {
    time: globalTime
  };
};

export default Two;
