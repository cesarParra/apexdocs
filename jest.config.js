module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/examples/'],
  moduleNameMapper: {
    '^chalk$': '<rootDir>/__mocks__/chalk.js',
    '^log-update$': '<rootDir>/__mocks__/log-update.js',
    '#utils/(.*)$': '<rootDir>/src/util/$1',
  },
};
