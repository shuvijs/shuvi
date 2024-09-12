import * as React from 'react';
import { Link } from '@shuvi/runtime';

// @note test purpose to trigger runtime error
const TO = undefined as unknown as string;

export default function Page() {
  return (
    <div>
      Demo runtime error - Link component missing required `prop.to`
      <br />
      <button id="button-link-without-to">
        <Link to={TO}>Click to trigger a fatal error at runtime</Link>
      </button>
    </div>
  );
}
