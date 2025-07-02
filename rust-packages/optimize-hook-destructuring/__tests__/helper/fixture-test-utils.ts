import * as fs from 'fs';
import * as path from 'path';

/**
 * Discover test fixtures in a directory
 */
function discoverFixtures(fixturesDir: string): string[] {
  return fs
    .readdirSync(fixturesDir)
    .filter(dir => fs.statSync(path.join(fixturesDir, dir)).isDirectory())
    .filter(dir => dir.match(/^\d{2}-/)) // Only numbered directories
    .sort();
}

/**
 * Get fixture test file paths
 */
function getFixtureTestFiles(
  fixturesDir: string,
  testDir: string
): {
  testDir: string;
  testPath: string;
  inputPath: string;
  outputPath: string;
  errorPath?: string;
  optionsPath?: string;
} | null {
  const testPath = path.join(fixturesDir, testDir);

  // Convention: try input.ts first, then input.tsx
  let inputPath: string | null = null;
  const tsPath = path.join(testPath, 'input.ts');
  const tsxPath = path.join(testPath, 'input.tsx');

  if (fs.existsSync(tsPath)) {
    inputPath = tsPath;
  } else if (fs.existsSync(tsxPath)) {
    inputPath = tsxPath;
  }

  if (!inputPath || !fs.existsSync(inputPath)) {
    return null;
  }

  // Convention: try output.swc.js first, then output.js
  let outputPath: string | null = null;
  const outputOldPath = path.join(testPath, 'output.js');
  const outputSWCPath = path.join(testPath, 'output.swc.js');

  if (fs.existsSync(outputSWCPath)) {
    outputPath = outputSWCPath;
  } else if (fs.existsSync(outputOldPath)) {
    outputPath = outputOldPath;
  }

  if (!outputPath) {
    return null;
  }

  const errorPath = path.join(testPath, 'error.txt');
  const optionsPath = path.join(testPath, 'options.json');

  return {
    testDir,
    testPath,
    inputPath,
    outputPath,
    errorPath,
    optionsPath
  };
}

/**
 * Read fixture test files
 */
function readFixtureTestFiles(testFiles: {
  inputPath: string;
  outputPath: string;
  errorPath?: string;
  optionsPath?: string;
}): {
  input: string;
  output?: string;
  error?: string;
  options?: any;
} {
  const input = fs.readFileSync(testFiles.inputPath, 'utf-8');
  let output: string | undefined;
  let error: string | undefined;
  let options: any = {};

  // Read output file if it exists
  if (fs.existsSync(testFiles.outputPath)) {
    output = fs.readFileSync(testFiles.outputPath, 'utf-8').trim();
  }

  // Read error file if it exists
  if (testFiles.errorPath && fs.existsSync(testFiles.errorPath)) {
    error = fs.readFileSync(testFiles.errorPath, 'utf-8').trim();
  }

  // Read options file if it exists
  if (testFiles.optionsPath && fs.existsSync(testFiles.optionsPath)) {
    const optionsContent = fs.readFileSync(testFiles.optionsPath, 'utf-8');
    options = JSON.parse(optionsContent);
  }

  return { input, output, error, options };
}

/**
 * Normalize quotes in a string (replace double quotes with single quotes)
 */
function normalizeQuotesAndSpace(str: string): string {
  return str.trim().replace(/"/g, "'");
}

/**
 * Create a test function for a fixture
 */
function createFixtureTest(
  testFiles: {
    inputPath: string;
    outputPath: string;
    errorPath?: string;
    optionsPath?: string;
  },
  testData: {
    input: string;
    output?: string;
    error?: string;
    options?: any;
  },
  transform: (code: string, options?: any) => Promise<string>,
  forceUpdateOutput: boolean = false
): () => Promise<void> {
  return async () => {
    if (testData.error) {
      // Test error case - convention: if error.txt exists, expect an error
      let error: any;
      try {
        await transform(testData.input, testData.options);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.toString()).toContain(testData.error);
    } else if (testData.output) {
      // Test output case - convention: if output.js exists, compare results
      const result = await transform(testData.input, testData.options);

      if (forceUpdateOutput) {
        // Update the output file with the actual result

        fs.writeFileSync(testFiles.outputPath, result);
        console.log(`Updated output file: ${testFiles.outputPath}`);
      }

      // Convention: always normalize quotes for comparison
      const normalizedResult = normalizeQuotesAndSpace(result);
      const normalizedExpectedOutput = normalizeQuotesAndSpace(testData.output);
      expect(normalizedResult).toBe(normalizedExpectedOutput);
    } else {
      // Test that transformation succeeds
      const result = await transform(testData.input, testData.options);
      expect(result).toBeDefined();
    }
  };
}

/**
 * Create a complete fixture test suite
 *
 * Conventions:
 * - Test directories must be numbered (e.g., 01-, 02-)
 * - Input files: input.ts or input.tsx
 * - Output files: output.js
 * - Error files: error.txt (if exists, expect error)
 * - Options files: options.json (if exists, merge with transform options)
 * - Always normalize quotes for comparison
 */
export function createFixtureTestSuite(
  fixturePath: string,
  {
    transform,
    forceUpdateOutput = false
  }: {
    transform: (code: string, options?: any) => Promise<string>;
    /**
     * equals to `npm run test -- --updateSnapshot`
     */
    forceUpdateOutput?: boolean;
  }
): void {
  const testDirs = discoverFixtures(fixturePath);

  for (const testDir of testDirs) {
    const testFiles = getFixtureTestFiles(fixturePath, testDir);

    if (!testFiles) {
      console.warn(`Skipping ${testDir}: missing input file`);
      continue;
    }

    // Check if required files exist
    const hasInput = fs.existsSync(testFiles.inputPath);
    const hasOutput = fs.existsSync(testFiles.outputPath);
    const hasError = testFiles.errorPath && fs.existsSync(testFiles.errorPath);

    if (!hasInput || (!hasOutput && !hasError)) {
      console.warn(`Skipping ${testDir}: missing required files`);
      continue;
    }

    test(
      `${testDir}`,
      createFixtureTest(
        testFiles,
        readFixtureTestFiles(testFiles),
        transform,
        forceUpdateOutput
      )
    );
  }
}
