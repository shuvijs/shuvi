import { readFileSync } from 'fs';
import { join } from 'path';

describe('Noop Plugin WASM', () => {
  it('should have a valid WASM file', () => {
    const wasmPath = join(__dirname, '..', 'swc_plugin_noop.wasm');

    // Check if WASM file exists
    expect(() => {
      readFileSync(wasmPath);
    }).not.toThrow();

    // Check if it's a valid WASM file (should start with WASM magic bytes)
    const wasmBuffer = readFileSync(wasmPath);
    const wasmMagic = new Uint8Array([0x00, 0x61, 0x73, 0x6d]); // \0asm

    expect(wasmBuffer.subarray(0, 4)).toEqual(wasmMagic);
  });

  it('should have reasonable file size', () => {
    const wasmPath = join(__dirname, '..', 'swc_plugin_noop.wasm');
    const stats = readFileSync(wasmPath);

    // WASM file should be at least 1KB and less than 10MB
    expect(stats.length).toBeGreaterThan(1024);
    expect(stats.length).toBeLessThan(10 * 1024 * 1024);
  });
});
