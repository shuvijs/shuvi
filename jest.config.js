module.exports = {
  verbose: true,

  bail: true,

  testEnvironment: "node",

  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  preset: "ts-jest",

  roots: ["<rootDir>/packages", "<rootDir>/test"],

  testMatch: ["**/*.test.{js,jsx,ts,tsx}"],
};
