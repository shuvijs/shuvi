import { traceGlobals } from '../shared';

// White list of events that can be telemetry.
const TRACE_EVENT_ACCESSLIST = new Map(
  Object.entries({
    'client-hmr-latency': 'SHUVI_CLIENT_HMR_LATENCY'
  })
);

const reportToTelemetry = (spanName: string, duration: number) => {
  const eventName = TRACE_EVENT_ACCESSLIST.get(spanName);

  if (!eventName) {
    return;
  }
  const telemetry = traceGlobals.get('telemetry');

  if (!telemetry) {
    return;
  }

  telemetry.record({
    eventName,
    payload: {
      durationInMicroseconds: duration
    }
  });
};

export default {
  flushAll: () => {},
  report: reportToTelemetry
};
