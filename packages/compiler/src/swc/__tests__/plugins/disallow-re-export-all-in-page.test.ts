import transform from '../swc-transform';

const swc = async (code: string) => {
  const options = {
    isPageFile: true
  };

  return transform(code, options)!;
};

describe('disallow re export all in page', () => {
  it('should throw error if export *', async () => {
    let error: any;

    try {
      await swc(`export * from 'react';`);
    } catch (e) {
      error = e;
    }
    expect(error.toString()).toContain(
      `Using \`export * from '...'\` in a page is disallowed`
    );
  });
});
