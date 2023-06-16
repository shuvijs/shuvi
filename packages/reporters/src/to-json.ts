import { randomBytes } from 'crypto';
import fs from 'fs';
import path from 'path';
import type { Reporter } from '@shuvi/shared/reporter';

type Event = {
  traceId: string;
  parentId?: number;
  name: string;
  id: number;
  timestamp: number;
  duration: number;
  tags?: Object;
  startTime?: number;
};

// Batch events as zipkin allows for multiple events to be sent in one go
function batcher(reportEvents: (evts: Event[]) => Promise<void>) {
  const events: Event[] = [];
  // Promise queue to ensure events are always sent on flushAll
  const queue = new Set();
  return {
    flushAll: async () => {
      await Promise.all(queue);
      if (events.length > 0) {
        await reportEvents(events);
        events.length = 0;
      }
    },
    report: (event: Event) => {
      events.push(event);

      if (events.length > 100) {
        const evts = events.slice();
        events.length = 0;
        const report = reportEvents(evts);
        queue.add(report);
        report.then(() => queue.delete(report));
      }
    }
  };
}

const writeStreamOptions = {
  flags: 'a',
  encoding: 'utf8' as const
};

class RotatingWriteStream {
  file: string;
  writeStream!: fs.WriteStream;
  size: number;
  sizeLimit: number;
  private rotatePromise: Promise<void> | undefined;
  private drainPromise: Promise<void> | undefined;
  constructor(file: string, sizeLimit: number) {
    this.file = file;
    this.size = 0;
    this.sizeLimit = sizeLimit;
    this.createWriteStream();
  }
  private createWriteStream() {
    this.writeStream = fs.createWriteStream(this.file, writeStreamOptions);
  }
  // Recreate the file
  private async rotate() {
    await this.end();
    try {
      fs.unlinkSync(this.file);
    } catch (err: any) {
      // It's fine if the file does not exist yet
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
    this.size = 0;
    this.createWriteStream();
    this.rotatePromise = undefined;
  }
  async write(data: string): Promise<void> {
    if (this.rotatePromise) await this.rotatePromise;

    this.size += data.length;
    if (this.size > this.sizeLimit) {
      await (this.rotatePromise = this.rotate());
    }

    if (!this.writeStream.write(data, 'utf8')) {
      if (this.drainPromise === undefined) {
        this.drainPromise = new Promise<void>((resolve, _reject) => {
          this.writeStream.once('drain', () => {
            this.drainPromise = undefined;
            resolve();
          });
        });
      }
      await this.drainPromise;
    }
  }

  end(): Promise<void> {
    return new Promise(resolve => {
      this.writeStream.end(resolve);
    });
  }
}

export class ToJson {
  private phase: string;
  private buildDir: string;
  private traceId: string;
  private writeStream: RotatingWriteStream | undefined;
  private batch: ReturnType<typeof batcher>;

  constructor(phase: string, buildDir: string, traceId: string) {
    this.phase = phase;
    this.buildDir = buildDir;
    this.traceId = traceId || randomBytes(8).toString('hex');
    this.batch = batcher(async events => {
      if (!this.writeStream) {
        await fs.promises.mkdir(this.buildDir, { recursive: true });
        const file = path.join(this.buildDir, 'trace');
        this.writeStream = new RotatingWriteStream(
          file,
          // Development is limited to 50MB, production is unlimited
          this.phase === 'PHASE_DEVELOPMENT_SERVER' ? 52428800 : Infinity
        );
      }
      const eventsJson = JSON.stringify(events);
      try {
        await this.writeStream.write(eventsJson + '\n');
      } catch (err) {
        console.log(err);
      }
    });
  }

  flushAll = () => {
    this.batch.flushAll().then(() => {
      // Only end writeStream when manually flushing in production
      if (this.phase !== 'PHASE_DEVELOPMENT_SERVER') {
        this.writeStream?.end();
      }
    });
  };

  report: Reporter = ({
    timestamp,
    name,
    duration,
    startTime,
    id,
    parentId,
    attrs
  }) => {
    if (!this.buildDir || !this.phase) {
      return;
    }

    this.batch.report({
      traceId: this.traceId,
      parentId,
      name,
      id,
      startTime,
      duration,
      timestamp,
      tags: attrs
    });
  };
}
