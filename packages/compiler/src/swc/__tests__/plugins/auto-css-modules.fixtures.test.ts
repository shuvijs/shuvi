import transform from '../swc-transform';
import fs from 'fs';
import path from 'path';

const swc = async (
  code: string,
  { cssModuleFlag }: { cssModuleFlag: string } = { cssModuleFlag: '' }
) => {
  const options = {
    cssModuleFlag
  };

  return transform(code, options)!;
};

describe('auto-css-modules fixtures', () => {
  const fixturesDir = path.join(__dirname, 'fixtures/auto-css-modules');

  // Get all test directories sorted by name
  const testDirs = fs
    .readdirSync(fixturesDir)
    .filter(dir => fs.statSync(path.join(fixturesDir, dir)).isDirectory())
    .filter(dir => dir.match(/^\d{2}-/)) // Only numbered directories
    .sort();

  for (const testDir of testDirs) {
    const testPath = path.join(fixturesDir, testDir);
    const inputPath = path.join(testPath, 'input.ts');
    const outputPath = path.join(testPath, 'output.js');
    const optionsPath = path.join(testPath, 'options.json');

    // Check if files exist
    if (!fs.existsSync(inputPath) || !fs.existsSync(outputPath)) {
      console.warn(`Skipping ${testDir}: missing input.ts or output.js`);
      continue;
    }

    test(`${testDir}`, async () => {
      // Read input and expected output
      const input = fs.readFileSync(inputPath, 'utf-8');
      const expectedOutput = fs.readFileSync(outputPath, 'utf-8').trim();

      // Read options if they exist
      let options = { cssModuleFlag: '' };
      if (fs.existsSync(optionsPath)) {
        const optionsContent = fs.readFileSync(optionsPath, 'utf-8');
        options = JSON.parse(optionsContent);
      }

      // Transform the input
      const result = await swc(input, options);

      // Compare with expected output
      expect(result.trim()).toBe(expectedOutput);
    });
  }
});
