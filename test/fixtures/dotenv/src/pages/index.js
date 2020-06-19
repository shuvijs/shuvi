export default () => (
  <div id="index">
    Index Page
    <br />
    <div id="publicValue">{process.env.SHUVI_PUBLIC_VALUE}</div>
    <br />
    <div id="valueNotFoundOnClient">{process.env.TEST_SHARE_VALUE}</div>
    <br />
    <div id="valueForwadedFromConfig">
      {process.env.FORWARD_TEST_SHARE_VALUE}
    </div>
    <div id="envSpecificValue">{process.env.SHUVI_PUBLIC_TEST_ENV_VALUE}</div>
  </div>
);
