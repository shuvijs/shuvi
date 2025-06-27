// Complex nested functions for testing source maps
function outerFunction(x: number) {
  const result = x * 2;

  function innerFunction(y: number) {
    const innerResult = y + result;

    function deepestFunction(z: number) {
      return innerResult * z;
    }

    return deepestFunction(y);
  }

  return innerFunction(x);
}

// Class with methods for source map testing
class SourceMapTest {
  private value: number;

  constructor(initialValue: number) {
    this.value = initialValue;
  }

  add(x: number): number {
    this.value += x;
    return this.value;
  }

  multiply(x: number): number {
    this.value *= x;
    return this.value;
  }

  complexOperation(x: number, y: number): number {
    const temp = this.add(x);
    const result = this.multiply(y);
    return temp + result;
  }
}

// Arrow functions with complex logic
const complexArrow = (a: number, b: number) => {
  const sum = a + b;
  const product = a * b;

  if (sum > 10) {
    return product * 2;
  } else {
    return sum / 2;
  }
};

// Async function for source map testing
async function asyncSourceMapTest(input: string): Promise<string> {
  const processed = input.toUpperCase();

  return new Promise(resolve => {
    setTimeout(() => {
      resolve(processed + ' - processed');
    }, 100);
  });
}

export { outerFunction, SourceMapTest, complexArrow, asyncSourceMapTest };
