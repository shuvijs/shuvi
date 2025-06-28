const fs = require('fs');
const path = require('path');

// Utility functions
function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content, 'utf8');
}

function exists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

// Configuration class
class Config {
  private data: Record<string, any> = {};

  constructor(initialData?: Record<string, any>) {
    if (initialData) {
      this.data = { ...initialData };
    }
  }

  get(key: string): any {
    return this.data[key];
  }

  set(key: string, value: any): void {
    this.data[key] = value;
  }

  has(key: string): boolean {
    return key in this.data;
  }

  delete(key: string): boolean {
    if (this.has(key)) {
      delete this.data[key];
      return true;
    }
    return false;
  }

  toJSON(): string {
    return JSON.stringify(this.data, null, 2);
  }

  fromJSON(json: string): void {
    this.data = JSON.parse(json);
  }
}

// File processor
class FileProcessor {
  private config: Config;

  constructor(config?: Config) {
    this.config = config || new Config();
  }

  processFile(inputPath: string, outputPath: string): void {
    if (!exists(inputPath)) {
      throw new Error(`Input file does not exist: ${inputPath}`);
    }

    const content = readFile(inputPath);
    const processed = this.processContent(content);
    writeFile(outputPath, processed);
  }

  private processContent(content: string): string {
    // Simple processing: convert to uppercase
    return content.toUpperCase();
  }
}

// Export as CommonJS
module.exports = {
  readFile,
  writeFile,
  exists,
  Config,
  FileProcessor
};

// Also export as ES6 for compatibility
export { readFile, writeFile, exists, Config, FileProcessor };
