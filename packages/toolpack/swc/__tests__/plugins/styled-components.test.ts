import transform from '../swc-transform';
import { trim } from 'shuvi-test-utils';

const swc = async (code: string, styledComponents: any = {}) => {
  const filename = 'noop.js';

  const isTSFile = filename.endsWith('.ts');
  const isTypeScript = isTSFile || filename.endsWith('.tsx');
  const development = true;
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
    styledComponents,
    filename,
    sourceFileName: filename,
    jsc
  };

  return transform(code, options)!;
};

describe('styled components', () => {
  it('should add identifier', async () => {
    const output = await swc(
      `
    import styled from 'styled-components'

    const Test = styled.div\`
      width: 100%;
    \`
    const Test2 = true ? styled.div\`\` : styled.div\`\`
    const styles = { One: styled.div\`\` }
    let Component
    Component = styled.div\`\`
    const WrappedComponent = styled(Inner)\`\`
    `,
      {
        displayName: false,
        fileName: false,
        transpileTemplateLiterals: false
      }
    );

    expect(output).toMatchInlineSnapshot(`
      "import styled from 'styled-components';
      const Test = styled.div.withConfig({
          componentId: \\"sc-be31d94b-0\\"
      })\`
            width: 100%;
          \`;
      const Test2 = true ? styled.div.withConfig({
          componentId: \\"sc-be31d94b-1\\"
      })\`\` : styled.div.withConfig({
          componentId: \\"sc-be31d94b-2\\"
      })\`\`;
      const styles = {
          One: styled.div.withConfig({
              componentId: \\"sc-be31d94b-3\\"
          })\`\`
      };
      let Component;
      Component = styled.div.withConfig({
          componentId: \\"sc-be31d94b-4\\"
      })\`\`;
      const WrappedComponent = styled(Inner).withConfig({
          componentId: \\"sc-be31d94b-5\\"
      })\`\`;
      "
    `);
  });

  it('should use file name', async () => {
    const output = await swc(
      `
    import styled from "styled-components";

    const TestNormal = styled.div\`
      width: 100%;
    \`
    
    const Test = styled_default.default.div\`
      width: 100%;
    \`
    
    const TestCallExpression = styled_default.default(Test)\`
      height: 20px;
    \`
    `,
      {
        displayName: true,
        fileName: true
      }
    );

    expect(output).toMatchInlineSnapshot(`
      "import styled from \\"styled-components\\";
      const TestNormal = styled.div.withConfig({
          displayName: \\"noop__TestNormal\\",
          componentId: \\"sc-2c46dd28-0\\"
      })\`
            width: 100%;
          \`;
      const Test = styled_default.default.div\`
            width: 100%;
          \`;
      const TestCallExpression = styled_default.default(Test)\`
            height: 20px;
          \`;
      "
    `);
  });

  it('should add display names', async () => {
    const output = await swc(
      `
      import styled from 'styled-components'

      const Test = styled.div\`
        width: 100%;
      \`
      const Test2 = styled('div')\`\`
      const Test3 = true ? styled.div\`\` : styled.div\`\`
      const styles = { One: styled.div\`\` }
      let Component
      Component = styled.div\`\`
      const WrappedComponent = styled(Inner)\`\`
      class ClassComponent {
        static Child = styled.div\`\`
      }
      var GoodName = BadName = styled.div\`\`;
    `,
      {
        displayName: true,
        ssr: false,
        fileName: false,
        transpileTemplateLiterals: false
      }
    );

    expect(output).toMatchInlineSnapshot(`
      "function _defineProperty(obj, key, value) {
          if (key in obj) {
              Object.defineProperty(obj, key, {
                  value: value,
                  enumerable: true,
                  configurable: true,
                  writable: true
              });
          } else {
              obj[key] = value;
          }
          return obj;
      }
      import styled from 'styled-components';
      const Test = styled.div.withConfig({
          displayName: \\"Test\\"
      })\`
              width: 100%;
            \`;
      const Test2 = styled('div').withConfig({
          displayName: \\"Test2\\"
      })\`\`;
      const Test3 = true ? styled.div.withConfig({
          displayName: \\"Test3\\"
      })\`\` : styled.div.withConfig({
          displayName: \\"Test3\\"
      })\`\`;
      const styles = {
          One: styled.div.withConfig({
              displayName: \\"One\\"
          })\`\`
      };
      let Component;
      Component = styled.div.withConfig({
          displayName: \\"Component\\"
      })\`\`;
      const WrappedComponent = styled(Inner).withConfig({
          displayName: \\"WrappedComponent\\"
      })\`\`;
      class ClassComponent {
      }
      _defineProperty(ClassComponent, \\"Child\\", styled.div.withConfig({
          displayName: \\"Child\\"
      })\`\`);
      var GoodName = BadName = styled.div.withConfig({
          displayName: \\"GoodName\\"
      })\`\`;
      "
    `);
  });

  it('should add identifier with top level import paths', async () => {
    const output = await swc(
      `
      import styled from '@xstyled/styled-components'

      const Test = styled.div\`
        width: 100%;
      \`
      const Test2 = true ? styled.div\`\` : styled.div\`\`
      const styles = { One: styled.div\`\` }
      let Component
      Component = styled.div\`\`
      const WrappedComponent = styled(Inner)\`\`
    `,
      {
        displayName: false,
        fileName: false,
        ssr: true,
        topLevelImportPaths: [
          '@xstyled/styled-components',
          '@xstyled/styled-components/no-tags',
          '@xstyled/styled-components/native',
          '@xstyled/styled-components/primitives'
        ],
        transpileTemplateLiterals: false
      }
    );

    expect(output).toMatchInlineSnapshot(`
      "import styled from '@xstyled/styled-components';
      const Test = styled.div.withConfig({
          componentId: \\"sc-269e3c80-0\\"
      })\`
              width: 100%;
            \`;
      const Test2 = true ? styled.div.withConfig({
          componentId: \\"sc-269e3c80-1\\"
      })\`\` : styled.div.withConfig({
          componentId: \\"sc-269e3c80-2\\"
      })\`\`;
      const styles = {
          One: styled.div.withConfig({
              componentId: \\"sc-269e3c80-3\\"
          })\`\`
      };
      let Component;
      Component = styled.div.withConfig({
          componentId: \\"sc-269e3c80-4\\"
      })\`\`;
      const WrappedComponent = styled(Inner).withConfig({
          componentId: \\"sc-269e3c80-5\\"
      })\`\`;
      "
    `);
  });

  it('should transpile css prop', async () => {
    const output = await swc(
      `
      const StaticString = p => <p css="flex: 1;">A</p>

      const StaticTemplate = p => (
        <p
          css={\`
            flex: 1;
          \`}
        >
          A
        </p>
      )

      const ObjectProp = p => <p css={{ color: 'blue' }}>A</p>

      const NoChildren = p => <p css="flex: 1;" />

      const CssHelperProp = p => (
        <p
          css={css\`
            color: blue;
          \`}
        >
          A
        </p>
      )

      /*
      * Dynamic prop
      */

      const CustomComp = p => <Paragraph css="flex: 1">H</Paragraph>

      const DynamicProp = p => <p css={props.cssText}>H</p>

      const LocalInterpolation = p => (
        <p
          css={\`
            background: \${props.bg};
          \`}
        >
          H
        </p>
      )

      const FuncInterpolation = p => (
        <p
          css={\`
            color: \${props => props.theme.a};
          \`}
        >
          H
        </p>
      )

      const radius = 10
      const GlobalInterpolation = p => (
        <p
          css={\`
            border-radius: \${radius}px;
          \`}
        >
          H
        </p>
      )

      const LocalCssHelperProp = p => (
        <p
          css={css\`
            color: \${p.color};
          \`}
        >
          A
        </p>
      )

      const DynamicCssHelperProp = p => (
        <p
          css={css\`
            color: \${props => props.theme.color};
          \`}
        >
          A
        </p>
      )

      const CustomCompWithDot = p => <Button.Ghost css="flex: 1">H</Button.Ghost>

      const NestedCompWithDot = p => (
        <Button.Ghost.New css="flex: 1">H</Button.Ghost.New>
      )

      const CustomCompWithDotLowerCase = p => (
        <button.ghost css="flex: 1">H</button.ghost>
      )

      const CustomElement = p => <button-ghost css="flex: 1">H</button-ghost>

      /* styled component defined after function it's used in */

      const EarlyUsageComponent = p => <Thing3 css="color: red;" />

      const Thing3 = styled.div\`
        color: blue;
      \`

      const ObjectInterpolation = p => {
        const theme = useTheme()

        return (
          <p
            css={{
              color: theme.colors.red,
            }}
          >
            H
          </p>
        )
      }

      const ObjectInterpolationCustomComponent = p => {
        const theme = useTheme()

        return (
          <Thing3
            css={{
              color: theme.colors.red,
            }}
          >
            H
          </Thing3>
        )
      }

      const ObjectInterpolationInKey = p => {
        const theme = useTheme()

        return (
          <Thing3
            css={{
              [theme.breakpoints.md]: {
                color: 'red',
              },
            }}
          >
            H
          </Thing3>
        )
      }

      const ObjectFnInterpolationInKey = p => {
        const theme = useTheme()

        return (
          <Thing3
            css={{
              [theme.breakpoints.md()]: {
                color: 'red',
              },
            }}
          >
            H
          </Thing3>
        )
      }

      const ObjectFnSimpleInterpolationInKey = p => {
        const foo = '@media screen and (max-width: 600px)'

        return (
          <Thing3
            css={{
              [foo]: {
                color: 'red',
              },
            }}
          >
            H
          </Thing3>
        )
      }

      const ObjectPropMixedInputs = p => {
        const color = 'red'

        return (
          <p
            css={{
              background: p.background,
              color,
              textAlign: 'left',
              '::before': { content: globalVar },
              '::after': { content: getAfterValue() },
            }}
          >
            A
          </p>
        )
      }

      const ObjectPropWithSpread = () => {
        const css = { color: 'red' }
        const playing = true

        return (
          <div
            css={{
              ...css,
              ...(playing ? { opacity: 0, bottom: '-100px' } : {}),
            }}
          />
        )
      }
    `,
      {
        ssr: false,
        displayName: false,
        transpileTemplateLiterals: false,
        cssProp: true
      }
    );

    expect(output).toMatchInlineSnapshot(`
      "import { jsxDEV as _jsxDEV } from \\"react/jsx-dev-runtime\\";
      import _styled from \\"styled-components\\";
      const StaticString = (p)=>/*#__PURE__*/ _jsxDEV(_StyledP, {
              children: \\"A\\"
          }, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 2,
              columnNumber: 33
          }, this);
      const StaticTemplate = (p)=>/*#__PURE__*/ _jsxDEV(_StyledP2, {
              children: \\"A\\"
          }, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 5,
              columnNumber: 9
          }, this);
      const ObjectProp = (p)=>/*#__PURE__*/ _jsxDEV(_StyledP3, {
              children: \\"A\\"
          }, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 14,
              columnNumber: 31
          }, this);
      const NoChildren = (p)=>/*#__PURE__*/ _jsxDEV(_StyledP4, {}, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 16,
              columnNumber: 31
          }, this);
      const CssHelperProp = (p)=>/*#__PURE__*/ _jsxDEV(_StyledP5, {
              children: \\"A\\"
          }, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 19,
              columnNumber: 9
          }, this);
      /*
            * Dynamic prop
            */ const CustomComp = (p)=>/*#__PURE__*/ _jsxDEV(_StyledParagraph, {
              children: \\"H\\"
          }, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 32,
              columnNumber: 31
          }, this);
      const DynamicProp = (p)=>/*#__PURE__*/ _jsxDEV(_StyledP6, {
              $_css: props.cssText,
              children: \\"H\\"
          }, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 34,
              columnNumber: 32
          }, this);
      const LocalInterpolation = (p)=>/*#__PURE__*/ _jsxDEV(_StyledP7, {
              $_css2: props.bg,
              children: \\"H\\"
          }, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 37,
              columnNumber: 9
          }, this);
      const FuncInterpolation = (p)=>/*#__PURE__*/ _jsxDEV(_StyledP8, {
              children: \\"H\\"
          }, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 47,
              columnNumber: 9
          }, this);
      const radius = 10;
      const GlobalInterpolation = (p)=>/*#__PURE__*/ _jsxDEV(_StyledP9, {
              children: \\"H\\"
          }, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 58,
              columnNumber: 9
          }, this);
      const LocalCssHelperProp = (p)=>/*#__PURE__*/ _jsxDEV(_StyledP10, {
              $_css3: p.color,
              children: \\"A\\"
          }, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 68,
              columnNumber: 9
          }, this);
      const DynamicCssHelperProp = (p)=>/*#__PURE__*/ _jsxDEV(_StyledP11, {
              children: \\"A\\"
          }, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 78,
              columnNumber: 9
          }, this);
      const CustomCompWithDot = (p)=>/*#__PURE__*/ _jsxDEV(_StyledButtonGhost, {
              children: \\"H\\"
          }, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 87,
              columnNumber: 38
          }, this);
      const NestedCompWithDot = (p)=>/*#__PURE__*/ _jsxDEV(_StyledButtonGhostNew, {
              children: \\"H\\"
          }, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 90,
              columnNumber: 9
          }, this);
      const CustomCompWithDotLowerCase = (p)=>/*#__PURE__*/ _jsxDEV(_StyledButtonGhost2, {
              children: \\"H\\"
          }, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 94,
              columnNumber: 9
          }, this);
      const CustomElement = (p)=>/*#__PURE__*/ _jsxDEV(_StyledButtonGhost3, {
              children: \\"H\\"
          }, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 97,
              columnNumber: 34
          }, this);
      /* styled component defined after function it's used in */ const EarlyUsageComponent = (p)=>/*#__PURE__*/ _jsxDEV(_StyledThing, {}, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 101,
              columnNumber: 40
          }, this);
      const Thing3 = styled.div\`
              color: blue;
            \`;
      var _StyledThing5 = _styled(Thing3)((p)=>({
              [p.$_css8]: {
                  color: 'red'
              }
          }));
      var _StyledThing4 = _styled(Thing3)((p)=>({
              [p.$_css7]: {
                  color: 'red'
              }
          }));
      var _StyledThing3 = _styled(Thing3)((p)=>({
              [p.$_css6]: {
                  color: 'red'
              }
          }));
      var _StyledThing2 = _styled(Thing3)((p)=>({
              color: p.$_css5
          }));
      var _StyledThing = _styled(Thing3)\`color: red;\`;
      const ObjectInterpolation = (p)=>{
          const theme = useTheme();
          return /*#__PURE__*/ _jsxDEV(_StyledP12, {
              $_css4: theme.colors.red,
              children: \\"H\\"
          }, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 111,
              columnNumber: 11
          }, this);
      };
      const ObjectInterpolationCustomComponent = (p)=>{
          const theme = useTheme();
          return /*#__PURE__*/ _jsxDEV(_StyledThing2, {
              $_css5: theme.colors.red,
              children: \\"H\\"
          }, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 125,
              columnNumber: 11
          }, this);
      };
      const ObjectInterpolationInKey = (p)=>{
          const theme = useTheme();
          return /*#__PURE__*/ _jsxDEV(_StyledThing3, {
              $_css6: theme.breakpoints.md,
              children: \\"H\\"
          }, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 139,
              columnNumber: 11
          }, this);
      };
      const ObjectFnInterpolationInKey = (p)=>{
          const theme = useTheme();
          return /*#__PURE__*/ _jsxDEV(_StyledThing4, {
              $_css7: theme.breakpoints.md(),
              children: \\"H\\"
          }, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 155,
              columnNumber: 11
          }, this);
      };
      const ObjectFnSimpleInterpolationInKey = (p)=>{
          const foo = '@media screen and (max-width: 600px)';
          return /*#__PURE__*/ _jsxDEV(_StyledThing5, {
              $_css8: foo,
              children: \\"H\\"
          }, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 171,
              columnNumber: 11
          }, this);
      };
      const ObjectPropMixedInputs = (p)=>{
          const color = 'red';
          return /*#__PURE__*/ _jsxDEV(_StyledP13, {
              $_css9: p.background,
              $_css10: color,
              $_css11: globalVar,
              $_css12: getAfterValue(),
              children: \\"A\\"
          }, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 187,
              columnNumber: 11
          }, this);
      };
      const ObjectPropWithSpread = ()=>{
          const css = {
              color: 'red'
          };
          const playing = true;
          return /*#__PURE__*/ _jsxDEV(_StyledDiv, {
              $_css13: css,
              $_css14: playing ? {
                  opacity: 0,
                  bottom: '-100px'
              } : {}
          }, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 206,
              columnNumber: 11
          }, this);
      };
      var _StyledP = _styled(\\"p\\")\`flex: 1;\`;
      var _StyledP2 = _styled(\\"p\\")\`
                  flex: 1;
                \`;
      var _StyledP3 = _styled(\\"p\\")({
          color: 'blue'
      });
      var _StyledP4 = _styled(\\"p\\")\`flex: 1;\`;
      var _StyledP5 = _styled(\\"p\\")\`
                  color: blue;
                \`;
      var _StyledParagraph = _styled(Paragraph)\`flex: 1\`;
      var _StyledP6 = _styled(\\"p\\")\`\${(p)=>p.$_css}\`;
      var _StyledP7 = _styled(\\"p\\")\`
                  background: \${(p)=>p.$_css2};
                \`;
      var _StyledP8 = _styled(\\"p\\")\`
                  color: \${(props1)=>props1.theme.a};
                \`;
      var _StyledP9 = _styled(\\"p\\")\`
                  border-radius: \${radius}px;
                \`;
      var _StyledP10 = _styled(\\"p\\")\`
                  color: \${(p)=>p.$_css3};
                \`;
      var _StyledP11 = _styled(\\"p\\")\`
                  color: \${(props1)=>props1.theme.color};
                \`;
      var _StyledButtonGhost = _styled(Button.Ghost)\`flex: 1\`;
      var _StyledButtonGhostNew = _styled(Button.Ghost.New)\`flex: 1\`;
      var _StyledButtonGhost2 = _styled(button.ghost)\`flex: 1\`;
      var _StyledButtonGhost3 = _styled(\\"button-ghost\\")\`flex: 1\`;
      var _StyledP12 = _styled(\\"p\\")((p)=>({
              color: p.$_css4
          }));
      var _StyledP13 = _styled(\\"p\\")((p)=>({
              background: p.$_css9,
              color: p.$_css10,
              textAlign: 'left',
              '::before': {
                  content: p.$_css11
              },
              '::after': {
                  content: p.$_css12
              }
          }));
      var _StyledDiv = _styled(\\"div\\")((p)=>({
              ...p.$_css13,
              ...p.$_css14
          }));
      "
    `);
  });

  it('should use namespace', async () => {
    const output = await swc(
      `
      import * as styled from 'styled-components'

      const css = styled.css\`
        background: black;
      \`

      const GlobalStyle = styled.createGlobalStyle\`
        html {
          background: black;
        }
      \`

      const Test = styled.default.div\`
        color: red;
      \`

      const before = styled.default.div\`
        color: blue;
      \`

      styled.default.div\`\`

      export default styled.default.button\`\`
    `,
      {
        displayName: false,
        namespace: 'test-namespace'
      }
    );

    expect(output).toMatchInlineSnapshot(`
      "import * as styled from 'styled-components';
      const css = styled.css\`
              background: black;
            \`;
      const GlobalStyle = styled.createGlobalStyle\`
              html {
                background: black;
              }
            \`;
      const Test = styled.default.div.withConfig({
          componentId: \\"test-namespace__sc-959815fc-0\\"
      })\`
              color: red;
            \`;
      const before = styled.default.div.withConfig({
          componentId: \\"test-namespace__sc-959815fc-1\\"
      })\`
              color: blue;
            \`;
      styled.default.div.withConfig({
          componentId: \\"test-namespace__sc-959815fc-2\\"
      })\`\`;
      export default styled.default.button.withConfig({
          componentId: \\"test-namespace__sc-959815fc-3\\"
      })\`\`;
      "
    `);
  });

  it('should ignore external styled import', async () => {
    const output = await swc(
      `
      import { styled } from '@material/ui'
      import s from 'styled-components'

      const Paragraph = s.p\`
        color: green;
      \`

      const Foo = p => <Paragraph {...p} />
      const TestNormal = styled(Foo)({ color: red })
    `,
      {}
    );

    expect(output).toMatchInlineSnapshot(`
      "import { jsxDEV as _jsxDEV } from \\"react/jsx-dev-runtime\\";
      import { styled } from '@material/ui';
      import s from 'styled-components';
      const Paragraph = s.p.withConfig({
          displayName: \\"noop__Paragraph\\",
          componentId: \\"sc-24186fee-0\\"
      })\`
              color: green;
            \`;
      const Foo = (p)=>/*#__PURE__*/ _jsxDEV(Paragraph, {
              ...p
          }, void 0, false, {
              fileName: \\"noop.js\\",
              lineNumber: 9,
              columnNumber: 24
          }, this);
      const TestNormal = styled(Foo)({
          color: red
      });
      "
    `);
  });
});
