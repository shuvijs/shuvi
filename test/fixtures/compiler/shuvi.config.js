export default {
  ssr: true,
  compiler: {
    reactRemoveProperties: { properties: ['^custom-data'] },
    removeConsole: true,
    styledComponents: {
      displayName: true,
      fileName: true,
      cssProp: true
    },
    emotion: {
      sourceMap: true,
      autoLabel: 'dev-only',
      labelFormat: 'custom--[local]'
    }
  },
  experimental: {
    modularizeImports: {
      '../../components': {
        transform: '../../components/{{member}}'
      }
    },
    swcPlugins: [
      '@swc/plugin-transform-imports',
      {
        '../../components': {
          transform: '../../components/{{member}}'
        }
      }
    ]
  },
  plugins: [['./plugin']]
};
