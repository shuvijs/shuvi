import { launchFixtureAtCurrentProcess } from '../utils';
import * as http from 'http';

jest.setTimeout(5 * 60 * 1000);

afterEach(() => {
  // force require to load file to make sure compiled file get load correctly
  jest.resetModules();
});

// Track console.warn calls to detect compilation warnings
let consoleWarnCalls: string[] = [];

// Mock console.warn to capture the compilation warning
const originalConsoleWarn = console.warn;
beforeAll(() => {
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    consoleWarnCalls.push(message);
    originalConsoleWarn(...args);
  };
});

afterAll(() => {
  console.warn = originalConsoleWarn;
});

function getCompilationWarnings(): string[] {
  return consoleWarnCalls.filter(call =>
    call.includes('You should compile the module before using it.')
  );
}

function hasCompilationWarning(): boolean {
  return getCompilationWarnings().length > 0;
}

function clearCompilationWarnings(): void {
  consoleWarnCalls = [];
}

function makeHttpRequest(
  url: string
): Promise<{ statusCode: number; data: string }> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'test-agent'
      }
    };

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode || 200, data });
      });
    });

    req.on('error', err => {
      reject(err);
    });

    req.end();
  });
}

describe('On Demand Compile - HTTP Mock', () => {
  let ctx: any;
  const originalNodeEnv: string = (process.env as any).NODE_ENV;

  beforeAll(async () => {
    (process.env as any).NODE_ENV = 'development';
    ctx = await launchFixtureAtCurrentProcess('on-demand-compile');
  });

  afterAll(async () => {
    await ctx?.close();
    (process.env as any).NODE_ENV = originalNodeEnv;
  });

  beforeEach(() => {
    // Clear warnings before each test
    clearCompilationWarnings();
  });

  test('should not have compilation warnings initially', () => {
    expect(hasCompilationWarning()).toBe(false);
    expect(getCompilationWarnings().length).toEqual(0);
  });

  test('should show compilation warning on HTTP request (on-demand behavior)', async () => {
    // Clear any existing warnings
    clearCompilationWarnings();
    expect(hasCompilationWarning()).toBe(false);

    // Use HTTP request instead of browser
    const response = await makeHttpRequest(ctx.url('/'));
    expect(response.statusCode).toBe(200);

    // Wait a bit for any potential compilation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In on-demand compilation, we should see the warning
    // because the module is not compiled and shows placeholder
    expect(hasCompilationWarning()).toBe(true);
    expect(getCompilationWarnings().length).toBeGreaterThan(0);

    // Verify the specific warning message
    const warnings = getCompilationWarnings();
    expect(
      warnings.some(warning =>
        warning.includes('You should compile the module before using it.')
      )
    ).toBe(true);
  });

  test('should show compilation warning on different route HTTP request', async () => {
    // Clear any existing warnings
    clearCompilationWarnings();
    expect(hasCompilationWarning()).toBe(false);

    // Use HTTP request for /a route
    const response = await makeHttpRequest(ctx.url('/a'));
    expect(response.statusCode).toBe(200);

    // Wait a bit for any potential compilation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In on-demand compilation, we should see the warning
    // because the module is not compiled and shows placeholder
    expect(hasCompilationWarning()).toBe(true);
    expect(getCompilationWarnings().length).toBeGreaterThan(0);

    // Verify the specific warning message
    const warnings = getCompilationWarnings();
    expect(
      warnings.some(warning =>
        warning.includes('You should compile the module before using it.')
      )
    ).toBe(true);
  });
});
