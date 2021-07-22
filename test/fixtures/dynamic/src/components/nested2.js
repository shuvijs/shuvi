import { dynamic } from '@shuvi/services';

const BrowserLoaded = dynamic(
  async () => () => <div id="BrowserLoaded">Browser hydrated</div>,
  {
    ssr: false
  }
);

export default () => (
  <div>
    <div>Nested 2</div>
    <BrowserLoaded />
  </div>
);
