// Enhanced test dummy component for comprehensive testing
export default function () {
  return 'Dummy';
}

export const namedExport = 'Named Export';

export function testFunction() {
  return 'Test Function';
}

export class TestClass {
  constructor() {
    this.name = 'TestClass';
  }

  getValue() {
    return this.name;
  }
}

export const testObject = {
  name: 'Test Object',
  value: 42,
  method() {
    return this.value;
  }
};
