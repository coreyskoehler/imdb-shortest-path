// Import the function to be tested
const { describe, test, expect } = require('@jest/globals');
const { output } = require('./search');


// Write the test cases using Jest
describe('output function', () => {
  test('returns the correct output when inputs are valid', async () => {
    var result = await output('https://www.imdb.com/name/nm0000168/', 'https://www.imdb.com/name/nm0000237');
    expect(result.length).toEqual(3);
    result = await output('https://www.imdb.com/name/nm0666739/', 'https://www.imdb.com/name/nm0001804');
    expect(result.length).toEqual(3);
    var result = await output('https://www.imdb.com/name/nm0000204/', 'https://www.imdb.com/name/nm0000136');
    expect(result.length).toEqual(5);

  }, 1000000000);
  /*
  test('throws an error when inputs are invalid', () => {
    //expect(() => output('2', 3)).toThrow('Invalid input');
    //expect(() => output(null, 3)).toThrow('Invalid input');
    //expect(() => output(undefined, 3)).toThrow('Invalid input');
    //expect(() => output({}, 3)).toThrow('Invalid input');
  });
  */
});
