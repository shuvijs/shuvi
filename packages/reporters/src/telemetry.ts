import chalk from '@shuvi/utils/chalk';
import Conf from 'conf';
import { BinaryLike, createHash, randomBytes } from 'crypto';
import type { Reporter } from '@shuvi/shared/reporter';

import { getAnonymousMeta } from './helper/anonymous-meta';
import { _postPayload } from './helper/post-payload';
import { getRawProjectId } from './helper/project-id';

// This is the key that specifies when the user was informed about anonymous
// telemetry collection.
const TELEMETRY_KEY_NOTIFY_DATE = 'telemetry.notifiedAt';

// This is a quasi-persistent identifier used to dedupe recurring events. It's
// generated from random data and completely anonymous.
const TELEMETRY_KEY_ID = `telemetry.anonymousId`;

// This is the cryptographic salt that is included within every hashed value.
// This salt value is never sent to us, ensuring privacy and the one-way nature
// of the hash (prevents dictionary lookups of pre-computed hashes).
// See the `oneWayHash` function.
const TELEMETRY_KEY_SALT = `telemetry.salt`;

export type TelemetryEvent = { eventName: string; payload: object };

export type EventContext = {
  anonymousId?: string;
  projectId?: string;
  sessionId?: string;
  [key: string]: unknown;
};
export type EventMeta = { [key: string]: unknown };

export type EventBatchShape = {
  eventName: string;
  fields: object;
};

export type RecordObject = {
  isFulfilled: boolean;
  isRejected: boolean;
  value?: any;
  reason?: any;
};

export class Telemetry {
  private name: string;
  private conf: Conf<any> | null;
  private sessionId: string;
  private rawProjectId: string;
  private projectId: string;
  private meta: EventMeta;
  private context: EventContext;
  private postEndpoint: string | undefined;

  private queue: Set<Promise<RecordObject>>;

  constructor({
    name,
    meta,
    context,
    postEndpoint
  }: {
    name: string;
    meta?: EventMeta;
    context?: EventContext;
    postEndpoint?: string;
  }) {
    try {
      // `conf` incorrectly throws a permission error during initialization
      // instead of waiting for first use. We need to handle it, otherwise the
      // process may crash.
      this.conf = new Conf({ projectName: 'shuvijs' });
    } catch (_) {
      this.conf = null;
    }
    this.name = name;
    this.sessionId = randomBytes(32).toString('hex');
    this.rawProjectId = getRawProjectId();
    this.projectId = this._oneWayHash(this.rawProjectId);
    this.postEndpoint = postEndpoint;

    this.queue = new Set();

    this._notify();
    this.meta = { ...getAnonymousMeta(), ...meta };
    this.context = {
      anonymousId: this.anonymousId,
      projectId: this.projectId,
      sessionId: this.sessionId,
      ...context
    };
    Object.freeze(this.meta);
    Object.freeze(this.context);
  }

  get anonymousId(): string {
    const val = this.conf && this.conf.get(TELEMETRY_KEY_ID);
    if (val) {
      return val;
    }

    const generated = randomBytes(32).toString('hex');
    this.conf && this.conf.set(TELEMETRY_KEY_ID, generated);
    return generated;
  }

  get salt(): string {
    const val = this.conf && this.conf.get(TELEMETRY_KEY_SALT);
    if (val) {
      return val;
    }

    const generated = randomBytes(16).toString('hex');
    this.conf && this.conf.set(TELEMETRY_KEY_SALT, generated);
    return generated;
  }

  report: Reporter = (
    timestamp,
    name,
    duration,
    startTime,
    id,
    parentId,
    attrs
  ) => {
    this.record({
      eventName: name,
      payload: {
        parentId,
        name,
        id,
        startTime,
        duration,
        timestamp,
        tags: attrs
      }
    });
  };

  record(_events: TelemetryEvent | TelemetryEvent[]): Promise<RecordObject> {
    const _this = this;
    // pseudo try-catch
    async function wrapper() {
      return await _this._submitRecord(_events);
    }

    const prom = wrapper()
      .then(value => ({
        isFulfilled: true,
        isRejected: false,
        value
      }))
      .catch(reason => ({
        isFulfilled: false,
        isRejected: true,
        reason
      }))
      // Acts as `Promise#finally` because `catch` transforms the error
      .then(res => {
        // Clean up the event to prevent unbounded `Set` growth
        this.queue.delete(prom);
        return res;
      });

    // Track this `Promise` so we can flush pending events
    this.queue.add(prom);

    return prom;
  }

  async flush() {
    await Promise.all(this.queue).catch(() => null);
  }

  private _notify() {
    if (!this.conf) {
      return;
    }

    // The end-user has already been notified about our telemetry integration. We
    // don't need to constantly annoy them about it.
    // We will re-inform users about the telemetry if significant changes are
    // ever made.
    if (this.conf.get(TELEMETRY_KEY_NOTIFY_DATE, '')) {
      return;
    }
    this.conf.set(TELEMETRY_KEY_NOTIFY_DATE, Date.now().toString());

    console.log(
      `${chalk.magenta.bold('Attention')}: ${
        this.name
      } now collects completely anonymous telemetry regarding usage.`
    );
    console.log();
  }

  private _oneWayHash(payload: BinaryLike): string {
    const hash = createHash('sha256');

    // Always prepend the payload value with salt. This ensures the hash is truly
    // one-way.
    hash.update(this.salt);

    // Update is an append operation, not a replacement. The salt from the prior
    // update is still present!
    hash.update(payload);
    return hash.digest('hex');
  }

  private _submitRecord(
    _events: TelemetryEvent | TelemetryEvent[]
  ): Promise<any> {
    let events: TelemetryEvent[];
    if (Array.isArray(_events)) {
      events = _events;
    } else {
      events = [_events];
    }

    if (events.length < 1) {
      return Promise.resolve();
    }

    if (!this.postEndpoint) {
      return Promise.resolve();
    }

    return _postPayload(this.postEndpoint, {
      context: this.context,
      meta: this.meta,
      events: events.map(({ eventName, payload }) => ({
        eventName,
        fields: payload
      })) as Array<EventBatchShape>
    });
  }
}
