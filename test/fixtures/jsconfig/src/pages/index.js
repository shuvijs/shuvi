import { Head } from '@shuvi/runtime';
import Store from '@components/Store';

export default function () {
  return (
    <div>
      <Head>
        <title>My page title</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <p>Hello world!</p>
      <Store />
    </div>
  );
}
