import transform from '../swc-transform';

const swc = async (code: string, emotion: Record<string, any> = {}) => {
  const filename = 'noop.js';

  const isTSFile = filename.endsWith('.ts');
  const isTypeScript = isTSFile || filename.endsWith('.tsx');
  const development = process.env.NODE_ENV === 'development';
  const jsc = {
    target: 'es2021',
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
    emotion,
    filename,
    sourceMaps: false,
    sourceFileName: filename,
    disableShuviDynamic: false,
    jsc
  };

  return transform(code, options)!;
};

describe('emotion', () => {
  it('should support compress', async () => {
    const output = await swc(
      `
    import { css } from '@emotion/react'
    import styled from '@emotion/styled'

    const unitNormal = '1rem'
    const unitLarge = '2rem'

    const Example = styled.div\`
      margin: \${unitNormal} \${unitLarge};
    \`
    export const Animated = styled.div\`
      & code {
        background-color: linen;
      }
      animation: \${({ animation }) => animation} 0.2s infinite ease-in-out alternate;
    \`

    const shadowBorder = ({ width = '1px', color }) =>
      css\`
        box-shadow: inset 0px 0px 0px \${width} \${color};
      \`

    const StyledInput = styled.input\`
      \${shadowBorder({ color: 'red', width: '4px' })}
    \`
    `,
      {
        enabled: true,
        sourceMap: true,
        autoLabel: true
      }
    );

    expect(output).toMatchInlineSnapshot(`
      "import { css } from '@emotion/react';
      import styled from '@emotion/styled';
      const unitNormal = '1rem';
      const unitLarge = '2rem';
      const Example = /*#__PURE__*/ styled(\\"div\\", {
          target: \\"e6j9wbm0\\",
          label: \\"Example\\"
      })(\\"margin:\\", unitNormal, \\" \\", unitLarge, \\";\\");
      export const Animated = /*#__PURE__*/ styled(\\"div\\", {
          target: \\"e6j9wbm1\\",
          label: \\"Animated\\"
      })(\\"& code{background-color:linen;}animation:\\", ({ animation  })=>animation, \\" 0.2s infinite ease-in-out alternate;\\");
      const shadowBorder = ({ width ='1px' , color  })=>/*#__PURE__*/ css(\\"box-shadow:inset 0px 0px 0px \\", width, \\" \\", color, \\";\\", \\"shadowBorder\\");
      const StyledInput = /*#__PURE__*/ styled(\\"input\\", {
          target: \\"e6j9wbm2\\",
          label: \\"StyledInput\\"
      })(shadowBorder({
          color: 'red',
          width: '4px'
      }));
      "
    `);
  });

  it('should support css in callback', async () => {
    const output = await swc(
      `import { css, Global } from '@emotion/react'
    import styled from '@emotion/styled'
    import { PureComponent } from 'react'
    import ReactDOM from 'react-dom'
    
    const stylesInCallback = (props) =>
      css({
        color: 'red',
        background: 'yellow',
        width: \`\${props.scale * 100}px\`,
      })
    
    const styles = css({
      color: 'red',
      width: '20px',
    })
    
    const styles2 = css\`
      color: red;
      width: 20px;
    \`
    
    const DivContainer = styled.div({
      background: 'red',
    })
    
    const DivContainer2 = styled.div\`
      background: red;
    \`
    
    const SpanContainer = styled('span')({
      background: 'yellow',
    })
    
    export const DivContainerExtended = styled(DivContainer)\`\`
    export const DivContainerExtended2 = styled(DivContainer)({})
    
    const Container = styled('button')\`
      background: red;
      \${stylesInCallback}
      \${() =>
        css({
          background: 'red',
        })}
      color: yellow;
      font-size: 12px;
    \`
    
    const Container2 = styled.div\`
      background: red;
    \`
    
    export class SimpleComponent extends PureComponent {
      render() {
        return (
          <Container
            css={css\`
              color: hotpink;
            \`}
          >
            <Global
              styles={css\`
                html,
                body {
                  padding: 3rem 1rem;
                  margin: 0;
                  background: papayawhip;
                  min-height: 100%;
                  font-family: Helvetica, Arial, sans-serif;
                  font-size: 24px;
                }
              \`}
            />
            <span>hello</span>
          </Container>
        )
      }
    }
    
    ReactDOM.render(<SimpleComponent />, document.querySelector('#app'))
    `,
      {
        enabled: true,
        sourceMap: true,
        autoLabel: true
      }
    );

    expect(output).toMatchInlineSnapshot(`
      "import { jsx as _jsx, jsxs as _jsxs } from \\"react/jsx-runtime\\";
      import { css, Global } from '@emotion/react';
      import styled from '@emotion/styled';
      import { PureComponent } from 'react';
      import ReactDOM from 'react-dom';
      const stylesInCallback = (props)=>/*#__PURE__*/ css({
              color: 'red',
              background: 'yellow',
              width: \`\${props.scale * 100}px\`
          }, \\"label:stylesInCallback\\");
      const styles = /*#__PURE__*/ css({
          color: 'red',
          width: '20px'
      }, \\"label:styles\\");
      const styles2 = /*#__PURE__*/ css(\\"color:red;width:20px;\\", \\"styles2\\");
      const DivContainer = /*#__PURE__*/ styled(\\"div\\", {
          target: \\"e6j9wbm0\\",
          label: \\"DivContainer\\"
      })({
          background: 'red'
      });
      const DivContainer2 = /*#__PURE__*/ styled(\\"div\\", {
          target: \\"e6j9wbm1\\",
          label: \\"DivContainer2\\"
      })(\\"background:red;\\");
      const SpanContainer = /*#__PURE__*/ styled('span', {
          target: \\"e6j9wbm2\\",
          label: \\"SpanContainer\\"
      })({
          background: 'yellow'
      });
      export const DivContainerExtended = /*#__PURE__*/ styled(DivContainer, {
          target: \\"e6j9wbm3\\",
          label: \\"DivContainerExtended\\"
      })();
      export const DivContainerExtended2 = /*#__PURE__*/ styled(DivContainer, {
          target: \\"e6j9wbm4\\",
          label: \\"DivContainerExtended2\\"
      })({});
      const Container = /*#__PURE__*/ styled('button', {
          target: \\"e6j9wbm5\\",
          label: \\"Container\\"
      })(\\"background:red;\\", stylesInCallback, \\" \\", ()=>/*#__PURE__*/ css({
              background: 'red'
          }, \\"label:Container\\"), \\"      color:yellow;font-size:12px;\\");
      const Container2 = /*#__PURE__*/ styled(\\"div\\", {
          target: \\"e6j9wbm6\\",
          label: \\"Container2\\"
      })(\\"background:red;\\");
      export class SimpleComponent extends PureComponent {
          render() {
              return /*#__PURE__*/ _jsxs(Container, {
                  css: /*#__PURE__*/ css(\\"color:hotpink;\\", \\"Container2\\"),
                  children: [
                      /*#__PURE__*/ _jsx(Global, {
                          styles: [
                              css(\\"html,body{padding:3rem 1rem;margin:0;background:papayawhip;min-height:100%;font-family:Helvetica,Arial,sans-serif;font-size:24px;}\\")
                          ]
                      }),
                      /*#__PURE__*/ _jsx(\\"span\\", {
                          children: \\"hello\\"
                      })
                  ]
              });
          }
      }
      ReactDOM.render(/*#__PURE__*/ _jsx(SimpleComponent, {}), document.querySelector('#app'));
      "
    `);
  });

  it('should support namespace import', async () => {
    const output = await swc(
      `
      import * as emotionReact from '@emotion/react'
      import { PureComponent } from 'react'
      import ReactDOM from 'react-dom'
      
      const stylesInCallback = (props) =>
        emotionReact.css({
          color: 'red',
          background: 'yellow',
          width: \`\${props.scale * 100}px\`,
        })
      
      const styles = emotionReact.css({
        color: 'red',
        width: '20px',
      })
      
      const styles2 = emotionReact.css\`
        color: red;
        width: 20px;
      \`
      
      export class SimpleComponent extends PureComponent {
        render() {
          return (
            <div className={styles}>
              <span>hello</span>
            </div>
          )
        }
      }
      
      ReactDOM.render(<SimpleComponent />, document.querySelector('#app'))
      `,
      {
        enabled: true,
        sourceMap: true,
        autoLabel: true
      }
    );

    expect(output).toMatchInlineSnapshot(`
      "import { jsx as _jsx } from \\"react/jsx-runtime\\";
      import * as emotionReact from '@emotion/react';
      import { PureComponent } from 'react';
      import ReactDOM from 'react-dom';
      const stylesInCallback = (props)=>/*#__PURE__*/ emotionReact.css({
              color: 'red',
              background: 'yellow',
              width: \`\${props.scale * 100}px\`
          }, \\"label:stylesInCallback\\");
      const styles = /*#__PURE__*/ emotionReact.css({
          color: 'red',
          width: '20px'
      }, \\"label:styles\\");
      const styles2 = /*#__PURE__*/ emotionReact.css(\\"color:red;width:20px;\\", \\"label:styles2\\");
      export class SimpleComponent extends PureComponent {
          render() {
              return /*#__PURE__*/ _jsx(\\"div\\", {
                  className: styles,
                  children: /*#__PURE__*/ _jsx(\\"span\\", {
                      children: \\"hello\\"
                  })
              });
          }
      }
      ReactDOM.render(/*#__PURE__*/ _jsx(SimpleComponent, {}), document.querySelector('#app'));
      "
    `);
  });
});
