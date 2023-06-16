import { Telemetry } from '@shuvi/reporters';
//@ts-ignore
import pkgInfo from '../package.json';

const TELEMETRY_ENDPOINT = '';

export const telemetry = TELEMETRY_ENDPOINT
  ? new Telemetry({
      name: 'Shuvi.js',
      meta: { shuviVersion: pkgInfo.version },
      postEndpoint: TELEMETRY_ENDPOINT
    })
  : undefined;
