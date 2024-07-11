module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/lib/'],
  moduleNameMapper: {
    '^chalk$': '<rootDir>/__mocks__/chalk.js',
    '^log-update$': '<rootDir>/__mocks__/log-update.js',
  },
};
