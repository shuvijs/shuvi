let source: any;
const eventCallbacks: ((event: any) => void)[] = [];
let lastActivity = Date.now();
let initDataBeforeWsOnline: any[] = [];

function getSocketProtocol(protocol: string): string {
  return protocol === 'http:' ? 'ws' : 'wss';
}

export function addMessageListener(cb: (event: any) => void) {
  eventCallbacks.push(cb);
}

export function sendMessage(data: any) {
  if (!source || source.readyState !== source.OPEN) {
    initDataBeforeWsOnline.push(data);
    return;
  }
  return source.send(data);
}

export type HotDevClient = {
  sendMessage: (data: any) => void;
  subscribeToHmrEvent?: (handler: any) => void;
  reportRuntimeError?: (err: any) => void;
};

export function connectHMR(options: {
  path: string;
  timeout: number;
  log?: boolean;
  location: {
    protocol: string;
    hostname: string;
    port?: string;
  };
}) {
  if (!options.timeout) {
    options.timeout = 5000;
  }

  init();

  let timer = setInterval(function () {
    if (Date.now() - lastActivity > options.timeout) {
      handleDisconnect();
    }
  }, options.timeout / 2);

  function init() {
    if (source) source.close();
    let { protocol, hostname, port } = options.location;
    protocol = getSocketProtocol(protocol);
    let url = `${protocol}://${hostname}:${port}`;

    source = new WebSocket(`${url}${options.path}`);
    source.onopen = handleOnline;
    source.onerror = handleDisconnect;
    source.onmessage = handleMessage;
  }

  function handleOnline() {
    if (initDataBeforeWsOnline.length !== 0) {
      initDataBeforeWsOnline.forEach(data => {
        sendMessage(data);
      });
      initDataBeforeWsOnline = [];
    }

    if (options.log) console.log('[HMR] connected');

    lastActivity = Date.now();
  }

  function handleMessage(event: any) {
    lastActivity = Date.now();

    eventCallbacks.forEach(cb => {
      cb(event);
    });
  }

  function handleDisconnect() {
    clearInterval(timer);
    source.close();
    setTimeout(init, options.timeout);
  }
}
