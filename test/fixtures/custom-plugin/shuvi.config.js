export default {
  ssr: true,
  plugins: [['./src/plugin', { hello: 'hello', world: 'world' }]]
};
