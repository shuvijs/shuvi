import transform from '../swc-transform';

const swc = async (code: string, styledComponents: any = {}) => {
  const filename = 'noop.js';

  const jsc = {
    target: 'es2021',
    parser: {
      jsx: true
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

      const Test = styled.div\`color: red;\`;
      const before = styled.div\`color: blue;\`;
      styled.div\`\`;
      export default styled.button\`\`;
    `,
      {
        displayName: true,
        fileName: true
      }
    );

    expect(output).toMatchInlineSnapshot(`
      "import styled from \\"styled-components\\";
      const Test = styled.div.withConfig({
          displayName: \\"noop__Test\\",
          componentId: \\"sc-162be455-0\\"
      })\`color: red;\`;
      const before = styled.div.withConfig({
          displayName: \\"noop__before\\",
          componentId: \\"sc-162be455-1\\"
      })\`color: blue;\`;
      styled.div.withConfig({
          displayName: \\"noop\\",
          componentId: \\"sc-162be455-2\\"
      })\`\`;
      export default styled.button.withConfig({
          displayName: \\"noop\\",
          componentId: \\"sc-162be455-3\\"
      })\`\`;
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
      "import _styled from \\"styled-components\\";
      const StaticString = (p)=>/*#__PURE__*/ React.createElement(_StyledP, null, \\"A\\");
      const StaticTemplate = (p)=>/*#__PURE__*/ React.createElement(_StyledP2, null, \\"A\\");
      const ObjectProp = (p)=>/*#__PURE__*/ React.createElement(_StyledP3, null, \\"A\\");
      const NoChildren = (p)=>/*#__PURE__*/ React.createElement(_StyledP4, null);
      const CssHelperProp = (p)=>/*#__PURE__*/ React.createElement(_StyledP5, null, \\"A\\");
      /*
            * Dynamic prop
            */ const CustomComp = (p)=>/*#__PURE__*/ React.createElement(_StyledParagraph, null, \\"H\\");
      const DynamicProp = (p)=>/*#__PURE__*/ React.createElement(_StyledP6, {
              $_css: props.cssText
          }, \\"H\\");
      const LocalInterpolation = (p)=>/*#__PURE__*/ React.createElement(_StyledP7, {
              $_css2: props.bg
          }, \\"H\\");
      const FuncInterpolation = (p)=>/*#__PURE__*/ React.createElement(_StyledP8, null, \\"H\\");
      const radius = 10;
      const GlobalInterpolation = (p)=>/*#__PURE__*/ React.createElement(_StyledP9, null, \\"H\\");
      const LocalCssHelperProp = (p)=>/*#__PURE__*/ React.createElement(_StyledP10, {
              $_css3: p.color
          }, \\"A\\");
      const DynamicCssHelperProp = (p)=>/*#__PURE__*/ React.createElement(_StyledP11, null, \\"A\\");
      const CustomCompWithDot = (p)=>/*#__PURE__*/ React.createElement(_StyledButtonGhost, null, \\"H\\");
      const NestedCompWithDot = (p)=>/*#__PURE__*/ React.createElement(_StyledButtonGhostNew, null, \\"H\\");
      const CustomCompWithDotLowerCase = (p)=>/*#__PURE__*/ React.createElement(_StyledButtonGhost2, null, \\"H\\");
      const CustomElement = (p)=>/*#__PURE__*/ React.createElement(_StyledButtonGhost3, null, \\"H\\");
      /* styled component defined after function it's used in */ const EarlyUsageComponent = (p)=>/*#__PURE__*/ React.createElement(_StyledThing, null);
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
          return /*#__PURE__*/ React.createElement(_StyledP12, {
              $_css4: theme.colors.red
          }, \\"H\\");
      };
      const ObjectInterpolationCustomComponent = (p)=>{
          const theme = useTheme();
          return /*#__PURE__*/ React.createElement(_StyledThing2, {
              $_css5: theme.colors.red
          }, \\"H\\");
      };
      const ObjectInterpolationInKey = (p)=>{
          const theme = useTheme();
          return /*#__PURE__*/ React.createElement(_StyledThing3, {
              $_css6: theme.breakpoints.md
          }, \\"H\\");
      };
      const ObjectFnInterpolationInKey = (p)=>{
          const theme = useTheme();
          return /*#__PURE__*/ React.createElement(_StyledThing4, {
              $_css7: theme.breakpoints.md()
          }, \\"H\\");
      };
      const ObjectFnSimpleInterpolationInKey = (p)=>{
          const foo = '@media screen and (max-width: 600px)';
          return /*#__PURE__*/ React.createElement(_StyledThing5, {
              $_css8: foo
          }, \\"H\\");
      };
      const ObjectPropMixedInputs = (p)=>{
          const color = 'red';
          return /*#__PURE__*/ React.createElement(_StyledP13, {
              $_css9: p.background,
              $_css10: color,
              $_css11: globalVar,
              $_css12: getAfterValue()
          }, \\"A\\");
      };
      const ObjectPropWithSpread = ()=>{
          const css = {
              color: 'red'
          };
          const playing = true;
          return /*#__PURE__*/ React.createElement(_StyledDiv, {
              $_css13: css,
              $_css14: playing ? {
                  opacity: 0,
                  bottom: '-100px'
              } : {}
          });
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
      "function _extends() {
          _extends = Object.assign || function(target) {
              for(var i = 1; i < arguments.length; i++){
                  var source = arguments[i];
                  for(var key in source){
                      if (Object.prototype.hasOwnProperty.call(source, key)) {
                          target[key] = source[key];
                      }
                  }
              }
              return target;
          };
          return _extends.apply(this, arguments);
      }
      import { styled } from '@material/ui';
      import s from 'styled-components';
      const Paragraph = s.p.withConfig({
          displayName: \\"noop__Paragraph\\",
          componentId: \\"sc-24186fee-0\\"
      })\`
              color: green;
            \`;
      const Foo = (p)=>/*#__PURE__*/ React.createElement(Paragraph, _extends({}, p));
      const TestNormal = styled(Foo)({
          color: red
      });
      "
    `);
  });
});
