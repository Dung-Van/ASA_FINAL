
const Goal = require('./Goal');

test('Goal.toString => returns a string', async () => {
    var lightOn = new Goal({desire: "lightOn light0"})
    expect(typeof lightOn.toString()).toBe('string');
  });