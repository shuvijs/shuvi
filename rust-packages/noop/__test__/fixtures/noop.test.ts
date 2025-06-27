// Test fixture for noop plugin
// This file contains various JavaScript/TypeScript constructs to test the plugin

// Variable declarations
const message = 'Hello, World!';
let count = 0;
var globalVar = 'global';

// Function declarations
function greet(name: string): string {
  return `Hello, ${name}!`;
}

// Arrow functions
const add = (a: number, b: number): number => a + b;

// Class declarations
class Calculator {
  private value: number = 0;

  add(x: number): number {
    this.value += x;
    return this.value;
  }

  getValue(): number {
    return this.value;
  }
}

// TypeScript interfaces
interface User {
  id: number;
  name: string;
  email: string;
}

// TypeScript type aliases
type Status = 'pending' | 'success' | 'error';

// TypeScript enums
enum Color {
  Red = 'red',
  Green = 'green',
  Blue = 'blue'
}

// Control flow statements
if (count > 0) {
  console.log('Count is positive');
} else {
  console.log('Count is zero or negative');
}

// Loops
for (let i = 0; i < 10; i++) {
  count += i;
}

while (count < 100) {
  count++;
}

// Try-catch
try {
  const result = add(5, 3);
  console.log('Result:', result);
} catch (error) {
  console.error('Error:', error);
}

// Switch statement
switch (count) {
  case 0:
    console.log('Zero');
    break;
  case 1:
    console.log('One');
    break;
  default:
    console.log('Other');
}

// Object literals
const person = {
  name: 'John',
  age: 30,
  greet() {
    return `Hello, I'm ${this.name}`;
  }
};

// Array literals
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);

// Template literals
const template = `Count: ${count}, Message: ${message}`;

// Destructuring
const { name, age } = person;
const [first, second] = numbers;
console.log('Destructured:', name, age, first, second);

// Spread operator
const combined = [...numbers, ...doubled];

// Default exports
export default Calculator;

// Named exports
export { greet, add, User, Color };

// Import statements (commented out to avoid module resolution issues)
// import { useState, useEffect } from "react";

// Debugger statement
debugger;

// Empty statement
// Block statement
{
  const localVar = 'local';
  console.log(localVar);
}

// Labeled statement
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) {
      break outer;
    }
  }
}
