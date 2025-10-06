import RequireCacheHotReloader from '../require-cache-hot-reloader-plugin';

// Mock fs module
jest.mock('fs', () => ({
  realpathSync: jest.fn((path: string) => path)
}));

// Mock require.cache
const mockRequireCache: { [key: string]: any } = {};
Object.defineProperty(global, 'require', {
  value: {
    cache: mockRequireCache
  },
  writable: true
});

describe('RequireCacheHotReloader', () => {
  let plugin: RequireCacheHotReloader;

  beforeEach(() => {
    // Clear require.cache before each test
    Object.keys(mockRequireCache).forEach(key => {
      delete mockRequireCache[key];
    });

    plugin = new RequireCacheHotReloader();
  });

  describe('constructor', () => {
    it('should initialize with empty sets', () => {
      expect(plugin.previousOutputPathsWebpack5).toBeInstanceOf(Set);
      expect(plugin.currentOutputPathsWebpack5).toBeInstanceOf(Set);
      expect(plugin.previousOutputPathsWebpack5.size).toBe(0);
      expect(plugin.currentOutputPathsWebpack5.size).toBe(0);
    });
  });

  describe('apply method', () => {
    it('should be callable without throwing', () => {
      const mockCompiler = {
        hooks: {
          compilation: {
            tap: jest.fn()
          },
          assetEmitted: {
            tap: jest.fn()
          },
          afterEmit: {
            tap: jest.fn()
          }
        }
      };

      expect(() => plugin.apply(mockCompiler as any)).not.toThrow();
    });

    it('should register all required hooks', () => {
      const mockCompiler = {
        hooks: {
          compilation: {
            tap: jest.fn()
          },
          assetEmitted: {
            tap: jest.fn()
          },
          afterEmit: {
            tap: jest.fn()
          }
        }
      };

      plugin.apply(mockCompiler as any);

      expect(mockCompiler.hooks.compilation.tap).toHaveBeenCalledWith(
        'RequireCacheHotReloader',
        expect.any(Function)
      );
      expect(mockCompiler.hooks.assetEmitted.tap).toHaveBeenCalledWith(
        'RequireCacheHotReloader',
        expect.any(Function)
      );
      expect(mockCompiler.hooks.afterEmit.tap).toHaveBeenCalledWith(
        'RequireCacheHotReloader',
        expect.any(Function)
      );
    });
  });

  describe('cache management', () => {
    it('should track file paths correctly', () => {
      const filePath = '/path/to/file.js';

      plugin.currentOutputPathsWebpack5.add(filePath);
      expect(plugin.currentOutputPathsWebpack5.has(filePath)).toBe(true);

      plugin.currentOutputPathsWebpack5.delete(filePath);
      expect(plugin.currentOutputPathsWebpack5.has(filePath)).toBe(false);
    });

    it('should handle multiple file paths', () => {
      const file1 = '/path/to/file1.js';
      const file2 = '/path/to/file2.js';

      plugin.currentOutputPathsWebpack5.add(file1);
      plugin.currentOutputPathsWebpack5.add(file2);

      expect(plugin.currentOutputPathsWebpack5.size).toBe(2);
      expect(plugin.currentOutputPathsWebpack5.has(file1)).toBe(true);
      expect(plugin.currentOutputPathsWebpack5.has(file2)).toBe(true);
    });
  });

  describe('plugin name', () => {
    it('should have correct plugin name', () => {
      expect(plugin.constructor.name).toBe('RequireCacheHotReloader');
    });
  });

  describe('basic functionality', () => {
    it('should be instantiable', () => {
      expect(plugin).toBeInstanceOf(RequireCacheHotReloader);
    });

    it('should have required properties', () => {
      expect(plugin).toHaveProperty('previousOutputPathsWebpack5');
      expect(plugin).toHaveProperty('currentOutputPathsWebpack5');
      expect(plugin).toHaveProperty('apply');
    });
  });
});
