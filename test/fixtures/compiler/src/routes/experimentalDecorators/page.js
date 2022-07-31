import React, { Component } from 'react';

function Foo(symbol) {
  return function (component) {
    component.symbol = symbol;
  };
}

@Foo('symbol-string')
class Decorators extends Component {
  render() {
    return <div>{Decorators.symbol}</div>;
  }
}

export default Decorators;
