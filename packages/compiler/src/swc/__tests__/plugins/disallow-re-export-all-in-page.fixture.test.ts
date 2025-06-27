import transform from '../swc-transform';
import fs from 'fs';
import path from 'path';

const swc = async (code: string) => {
  const filename = 'test.tsx';
  const isTSFile = filename.endsWith('.ts');
  const isTypeScript = isTSFile || filename.endsWith('.tsx');
  const development = process.env.NODE_ENV === 'development';

  const jsc = {
    target: 'es5',
    parser: {
      syntax: isTypeScript ? 'typescript' : 'ecmascript',
      dynamicImport: false,
      // Exclude regular TypeScript files from React transformation to prevent e.g. generic parameters and angle-bracket type assertion from being interpreted as JSX tags.
      [isTypeScript ? 'tsx' : 'jsx']: isTSFile ? false : true
    },
    transform: {
      react: {
        importSource: 'react',
        runtime: 'automatic',
        pragma: 'React.createElement',
        pragmaFrag: 'React.Fragment',
        throwIfNamespace: true,
        development,
        useBuiltins: true,
        refresh: false
      }
    }
  };

  const options = {
    isPageFile: true,
    jsc
  };

  return transform(code, options)!;
};

describe('fixtures', () => {
  const fixturesDir = path.join(
    __dirname,
    'fixtures/disallow-re-export-all-in-page'
  );

  const testDirs = fs
    .readdirSync(fixturesDir)
    .filter(dir => fs.statSync(path.join(fixturesDir, dir)).isDirectory())
    .filter(dir => dir.match(/^\d{2}-/))
    .sort();

  for (const testDir of testDirs) {
    const testPath = path.join(fixturesDir, testDir);
    const inputPath = path.join(testPath, 'input.ts');
    const outputPath = path.join(testPath, 'output.js');
    const errorPath = path.join(testPath, 'error.txt');

    if (!fs.existsSync(inputPath)) {
      console.warn(`Skipping ${testDir}: missing input.ts`);
      continue;
    }

    test(`${testDir}`, async () => {
      const input = fs.readFileSync(inputPath, 'utf-8');

      if (fs.existsSync(errorPath)) {
        const expectedError = fs.readFileSync(errorPath, 'utf-8').trim();
        let error: any;

        try {
          await swc(input);
        } catch (e) {
          error = e;
        }

        expect(error).toBeDefined();
        expect(error.toString()).toContain(expectedError);
      } else if (fs.existsSync(outputPath)) {
        const expectedOutput = fs.readFileSync(outputPath, 'utf-8').trim();
        const result = await swc(input);
        // fs.writeFileSync(outputPath, result);
        expect(result.trim()).toBe(expectedOutput);
      } else {
        const result = await swc(input);
        expect(result).toBeDefined();
      }
    });
  }
});
