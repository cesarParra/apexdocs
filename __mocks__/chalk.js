// __mocks__/chalk.js
module.exports = new Proxy(
  {},
  {
    get: function (target, property) {
      return property === 'default' ? this : (text) => text;
    },
    green: function (text) {
      return text;
    },
  },
);
