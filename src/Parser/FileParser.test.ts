import FileParser from './FileParser';

test('empty string returns null', () => {
  const parser = new FileParser();

  expect(parser.parseFileContents('')).toBe(null);
});

// ----Classes----
// Top level description
// Class Name
// Group
// Content Group
// Author
// Date
// Implements
// Extends

//----Methods----
// TODO

//----Properties----
// TODO

//----Constructors----
// TODO

//----Methods----
// TODO

//----Inner Classess----
// TODO

//----Integration tests----
// class with no comments
// exception class
// empty class
// interface
// abstract class
// class with properties
// class with methods
// class with inner classes
// class with inner classes with methods and properties and constructors
// class with constructor
// class that extend other classes
// class that implements interfaces
