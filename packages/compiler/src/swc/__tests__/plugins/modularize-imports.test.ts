import transform from '../swc-transform';

const swc = async (
  code: string,
  modularizeImports: Record<string, any> = {}
) => {
  const options = {
    modularizeImports,
    disableShuviDynamic: false
  };

  return transform(code, options)!;
};

describe('modularize imports', () => {
  it('should change import to the module path', async () => {
    const output = await swc(
      `import { Grid, Row, Col as Col1 } from 'react-bootstrap';`,
      {
        'react-bootstrap': {
          transform: 'react-bootstrap/lib/{{member}}'
        }
      }
    );

    expect(output).toMatchInlineSnapshot(`
      "import Grid from \\"react-bootstrap/lib/Grid\\";
      import Row from \\"react-bootstrap/lib/Row\\";
      import Col1 from \\"react-bootstrap/lib/Col\\";
      "
    `);
  });

  it('should support regex transform', async () => {
    const output = await swc(
      `import { MyModule } from 'my-library';
    import { App } from 'my-library/components';
    import { Header, Footer } from 'my-library/components/App';`,
      {
        'my-library/?(((\\w*)?/?)*)': {
          transform: 'my-library/{{ matches.[1] }}/{{member}}'
        }
      }
    );

    expect(output).toMatchInlineSnapshot(`
      "import MyModule from \\"my-library/MyModule\\";
      import App from \\"my-library/components/App\\";
      import Header from \\"my-library/components/App/Header\\";
      import Footer from \\"my-library/components/App/Footer\\";
      "
    `);
  });
});
