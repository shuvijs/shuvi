import transform from '../swc-transform';
import fs from 'fs';
import path from 'path';

const swc = async (code: string, options: any = {}) => {
  return transform(code, options)!;
};

describe('transform fixtures', () => {
  const fixturesDir = path.join(__dirname, 'fixtures/transform');

  // Get all test directories sorted by name
  const testDirs = fs
    .readdirSync(fixturesDir)
    .filter(dir => fs.statSync(path.join(fixturesDir, dir)).isDirectory())
    .filter(dir => dir.match(/^\d{2}-/)) // Only numbered directories
    .sort();

  for (const testDir of testDirs) {
    const testPath = path.join(fixturesDir, testDir);
    const inputTsPath = path.join(testPath, 'input.ts');
    const inputTsxPath = path.join(testPath, 'input.tsx');
    const outputPath = path.join(testPath, 'output.js');
    const optionsPath = path.join(testPath, 'options.json');

    // Check if files exist - try both .ts and .tsx
    let inputPath = null;
    if (fs.existsSync(inputTsPath)) {
      inputPath = inputTsPath;
    } else if (fs.existsSync(inputTsxPath)) {
      inputPath = inputTsxPath;
    }

    if (!inputPath || !fs.existsSync(outputPath)) {
      console.warn(
        `Skipping ${testDir}: missing input.ts/input.tsx or output.js`
      );
      continue;
    }

    test(`${testDir}`, async () => {
      // Read input
      const input = fs.readFileSync(inputPath, 'utf-8');
      const expectedOutput = fs.readFileSync(outputPath, 'utf-8').trim();

      // Read options if they exist
      let options = {};
      if (fs.existsSync(optionsPath)) {
        const optionsContent = fs.readFileSync(optionsPath, 'utf-8');
        options = JSON.parse(optionsContent);
      }

      // Write the actual output to the output file to update fixtures
      // fs.writeFileSync(outputPath, actualOutput);

      // Transform the input
      const result = await swc(input, options);

      // Compare with expected output
      expect(result.trim()).toBe(expectedOutput);
    });
  }
});
