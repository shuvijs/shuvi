import createDebug, { Debugger } from "debug";

export interface Logger {
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

class LoggerImpl implements Logger {
  private _debug: Debugger;

  constructor(namespace: string) {
    this._debug = createDebug(namespace);
  }

  debug(formatter: any, ...args: any[]): void {
    this._debug(formatter, ...args);
  }

  info(...args: any[]): void {
    console.log("INFO:", ...args);
  }

  warn(...args: any[]): void {
    console.warn("WARN:", ...args);
  }

  error(...args: any[]): void {
    console.error("ERROR:", ...args);
  }
}

function logger(namespace: string): Logger {
  return new LoggerImpl(namespace);
}

export { logger };
