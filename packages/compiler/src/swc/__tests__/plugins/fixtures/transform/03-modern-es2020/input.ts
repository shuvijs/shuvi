// Optional chaining and nullish coalescing
interface User {
  name?: string;
  address?: {
    street?: string;
    city?: string;
  };
  preferences?: {
    theme?: string;
  };
}

const user: User = {
  name: 'John',
  address: {
    street: '123 Main St'
  }
};

// Optional chaining
const street = user.address?.street;
const theme = user.preferences?.theme;

// Nullish coalescing
const displayName = user.name ?? 'Anonymous';
const userTheme = theme ?? 'light';

// BigInt
const bigNumber = 123456789012345678901234567890n;
const anotherBigInt = BigInt('123456789012345678901234567890');

// Dynamic imports
const loadModule = async () => {
  const module = await import('./dynamic-module');
  return module.default;
};

// Top-level await (ES2022)
const data = await fetch('/api/data').then(res => res.json());

// Class fields and private methods
class ModernClass {
  #privateField = 'private';
  static #privateStaticField = 'private static';

  publicField = 'public';
  static publicStaticField = 'public static';

  #privateMethod() {
    return this.#privateField;
  }

  static #privateStaticMethod() {
    return ModernClass.#privateStaticField;
  }

  publicMethod() {
    return this.#privateMethod();
  }

  static publicStaticMethod() {
    return ModernClass.#privateStaticMethod();
  }
}

// Logical assignment operators
let x = 1;
x ||= 2; // x = x || 2
x &&= 3; // x = x && 3
x ??= 4; // x = x ?? 4

// Numeric separators
const million = 1_000_000;
const binary = 0b1010_0001_1000_0101;
const hex = 0xa0_b0_c0;

export {
  street,
  theme,
  displayName,
  userTheme,
  bigNumber,
  anotherBigInt,
  loadModule,
  data,
  ModernClass,
  x,
  million,
  binary,
  hex
};
