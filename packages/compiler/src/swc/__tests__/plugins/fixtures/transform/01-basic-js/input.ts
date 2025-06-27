const message = 'Hello, World!';
const numbers = [1, 2, 3, 4, 5];

// Arrow functions
const add = (a: number, b: number) => a + b;

// Template literals
const greeting = `Welcome ${message}`;

// Destructuring
const [first, second, ...rest] = numbers;

// Object spread
const config = { debug: true, port: 3000 };
const extendedConfig = { ...config, host: 'localhost' };

// Async/await
async function fetchData() {
  const response = await fetch('/api/data');
  return response.json();
}

// Class with modern features
class Calculator {
  private result = 0;

  add(value: number) {
    this.result += value;
    return this;
  }

  multiply(value: number) {
    this.result *= value;
    return this;
  }

  getResult() {
    return this.result;
  }
}

export { add, greeting, Calculator, fetchData };
