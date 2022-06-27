const Goal = require('./Goal');
const Intention = require('./Intention');



test('Intention.applicable', () => {
    expect( new Goal() instanceof Goal ).toBe(true);
    expect( Intention.applicable('string') ).toBe(false);
    expect( Intention.applicable(new Goal({param1: 'p1'})) ).toBe(true);
});

test('Intention.constructor', () => {
    var g = new Goal()
    expect( new Intention('agent', g).goal ).toBe(g);
});

test('Intention.run => success', async () => {
    var s1, s2, s3, s4;
    class DimOnLight extends Intention {    
    *exec () {
        s1 = yield new Promise( res => setTimeout(res, 50))  // promise
        s2 = yield 1234                                      // value
        s3 = yield false                                     // false
        s4 = yield                                           // none
    }
  }
  expect( await new DimOnLight(new Goal()).run() ).toBe(true);
  expect( s1 ).toBe(undefined);
  expect( s2 ).toBe(1234);
  expect( s3 ).toBe(false);
  expect( s4 ).toBe(undefined);
});

test('Intention.run => fail because of promise rejected', async () => {
    class DimOnLight extends Intention {    
    *exec () {
        yield Promise.reject('generic test-plan failure')
    }
  }
  expect( await new DimOnLight(new Goal()).run() ).toBe(false);
});

test('Intention.run => fail because of error throwed', async () => {
    class DimOnLight extends Intention {    
    *exec () {
        throw new Error('generic')
    }
  }
  expect( await new DimOnLight(new Goal()).run() ).toBe(false);
});
