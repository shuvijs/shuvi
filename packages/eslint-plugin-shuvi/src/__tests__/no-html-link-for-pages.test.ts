/* eslint-env jest */
import rule, { url } from '../rules/no-html-link-for-pages';
import { Linter } from 'eslint';
import * as path from 'path';

const withCustomPagesDirectory = path.join(__dirname, 'with-custom-pages-dir');

const withoutPagesLinter = new Linter({
  cwd: path.join(__dirname, 'without-pages-dir')
});
const withAppLinter = new Linter({
  cwd: path.join(__dirname, 'with-app-dir')
});
const withCustomPagesLinter = new Linter({
  cwd: withCustomPagesDirectory
});

const linterConfig: any = {
  rules: {
    'no-html-link-for-pages': [2]
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      modules: true,
      jsx: true
    }
  }
};
const linterConfigWithCustomDirectory: any = {
  ...linterConfig,
  rules: {
    'no-html-link-for-pages': [
      2,
      path.join(withCustomPagesDirectory, 'custom-pages')
    ]
  }
};
const linterConfigWithMultipleDirectories = {
  ...linterConfig,
  rules: {
    'no-html-link-for-pages': [
      2,
      [
        path.join(withCustomPagesDirectory, 'custom-pages'),
        path.join(withCustomPagesDirectory, 'custom-pages/list')
      ]
    ]
  }
};

withoutPagesLinter.defineRules({
  'no-html-link-for-pages': rule
});
withAppLinter.defineRules({
  'no-html-link-for-pages': rule
});
withCustomPagesLinter.defineRules({
  'no-html-link-for-pages': rule
});

const validCode = `
import Link from 'shuvi/runtime';

export class Blah extends Head {
  render() {
    return (
      <div>
        <Link href='/'>
          <a>Homepage</a>
        </Link>
        <h1>Hello title</h1>
      </div>
    );
  }
}
`;

const validAnchorCode = `
import Link from 'shuvi/runtime';

export class Blah extends Head {
  render() {
    return (
      <div>
        <a href='#heading'>Homepage</a>
        <h1>Hello title</h1>
      </div>
    );
  }
}
`;

const validExternalLinkCode = `
import Link from 'shuvi/runtime';

export class Blah extends Head {
  render() {
    return (
      <div>
        <a href='https://google.com/'>Homepage</a>
        <h1>Hello title</h1>
      </div>
    );
  }
}
`;

const validDownloadLinkCode = `
import Link from 'shuvi/runtime';

export class Blah extends Head {
  render() {
    return (
      <div>
        <a href='/static-file.csv' download>Download</a>
        <h1>Hello title</h1>
      </div>
    );
  }
}
`;
const validTargetBlankLinkCode = `
import Link from 'shuvi/runtime';

export class Blah extends Head {
  render() {
    return (
      <div>
        <a target="_blank" href='/new-tab'>New Tab</a>
        <h1>Hello title</h1>
      </div>
    );
  }
}
`;

const validPublicFile = `
import Link from 'shuvi/runtime';

export class Blah extends Head {
  render() {
    return (
      <div>
        <a href='https/presentation.pdf'>View PDF</a>
        <h1>Hello title</h1>
      </div>
    );
  }
}
`;

const invalidStaticCode = `
import Link from 'shuvi/runtime';

export class Blah extends Head {
  render() {
    return (
      <div>
        <a href='/'>Homepage</a>
        <h1>Hello title</h1>
      </div>
    );
  }
}
`;

const invalidDynamicCode = `
import Link from 'shuvi/runtime';

export class Blah extends Head {
  render() {
    return (
      <div>
        <a href='/list/foo/bar'>Homepage</a>
        <h1>Hello title</h1>
      </div>
    );
  }
}
`;
const secondInvalidDynamicCode = `
import Link from 'shuvi/runtime';

export class Blah extends Head {
  render() {
    return (
      <div>
        <a href='/list/foo/'>Homepage</a>
        <h1>Hello title</h1>
      </div>
    );
  }
}
`;

const thirdInvalidDynamicCode = `
import Link from 'shuvi/runtime';

export class Blah extends Head {
  render() {
    return (
      <div>
        <a href='/list/lorem-ipsum/'>Homepage</a>
        <h1>Hello title</h1>
      </div>
    );
  }
}
`;

describe('no-html-link-for-pages', function () {
  test('prints warning when there are no pages directory', function () {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    withoutPagesLinter.verify(validCode, linterConfig, {
      filename: 'page.js'
    });
    const rootDirectory = path.join(__dirname, 'without-pages-dir');
    expect(consoleSpy).toHaveBeenCalledWith(
      `Pages directory cannot be found at ${path.join(
        rootDirectory,
        'src',
        'routes'
      )}. If using a custom path, please configure with the \`no-html-link-for-pages\` rule in your eslint config file.`
    );

    consoleSpy.mockRestore();
  });

  test('valid link element', function () {
    const report = withCustomPagesLinter.verify(
      validCode,
      linterConfigWithCustomDirectory,
      {
        filename: 'page.js'
      }
    );
    expect(report).toEqual([]);
  });

  it('valid link element with multiple directories', function () {
    const report = withCustomPagesLinter.verify(
      validCode,
      linterConfigWithMultipleDirectories,
      {
        filename: 'page.js'
      }
    );
    expect(report).toEqual([]);
  });

  it('valid anchor element', function () {
    const report = withCustomPagesLinter.verify(
      validAnchorCode,
      linterConfigWithCustomDirectory,
      {
        filename: 'page.js'
      }
    );
    expect(report).toEqual([]);
  });

  it('valid external link element', function () {
    const report = withCustomPagesLinter.verify(
      validExternalLinkCode,
      linterConfigWithCustomDirectory,
      {
        filename: 'page.js'
      }
    );
    expect(report).toEqual([]);
  });

  it('valid download link element', function () {
    const report = withCustomPagesLinter.verify(
      validDownloadLinkCode,
      linterConfigWithCustomDirectory,
      {
        filename: 'page.js'
      }
    );
    expect(report).toEqual([]);
  });

  it('valid target="_blank" link element', function () {
    const report = withCustomPagesLinter.verify(
      validTargetBlankLinkCode,
      linterConfigWithCustomDirectory,
      {
        filename: 'page.js'
      }
    );
    expect(report).toEqual([]);
  });

  it('valid public file link element', function () {
    const report = withCustomPagesLinter.verify(
      validPublicFile,
      linterConfigWithCustomDirectory,
      {
        filename: 'page.js'
      }
    );
    expect(report).toEqual([]);
  });

  it('invalid static route', function () {
    const [report] = withCustomPagesLinter.verify(
      invalidStaticCode,
      linterConfigWithCustomDirectory,
      {
        filename: 'page.js'
      }
    );
    expect(report).not.toBeUndefined();
    expect(report.message).toEqual(
      `Do not use an \`<a>\` element to navigate to \`/\`. Use \`<Link />\` from \`shuvi/runtime\` instead. See: ${url}`
    );
  });

  it('invalid dynamic route', function () {
    const [report] = withCustomPagesLinter.verify(
      invalidDynamicCode,
      linterConfigWithCustomDirectory,
      {
        filename: 'page.js'
      }
    );
    expect(report).not.toBeUndefined();
    expect(report.message).toEqual(
      `Do not use an \`<a>\` element to navigate to \`/list/foo/bar/\`. Use \`<Link />\` from \`shuvi/runtime\` instead. See: ${url}`
    );
    const [secondReport] = withCustomPagesLinter.verify(
      secondInvalidDynamicCode,
      linterConfigWithCustomDirectory,
      {
        filename: 'page.js'
      }
    );
    expect(secondReport).not.toBeUndefined();
    expect(secondReport.message).toEqual(
      `Do not use an \`<a>\` element to navigate to \`/list/foo/\`. Use \`<Link />\` from \`shuvi/runtime\` instead. See: ${url}`
    );
    const [thirdReport] = withCustomPagesLinter.verify(
      thirdInvalidDynamicCode,
      linterConfigWithCustomDirectory,
      {
        filename: 'page.js'
      }
    );
    expect(thirdReport).not.toBeUndefined();
    expect(thirdReport.message).toEqual(
      `Do not use an \`<a>\` element to navigate to \`/list/lorem-ipsum/\`. Use \`<Link />\` from \`shuvi/runtime\` instead. See: ${url}`
    );
  });
});
