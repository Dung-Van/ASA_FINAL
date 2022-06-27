const Agent = require('./Agent')
const Intention = require('./Intention');
const Goal = require('./Goal');



class LightOn extends Goal {
}



test('Agent.constructor', () => {
  expect(new Agent('a1').name).toBe('a1');
});

test('Agent.postSubGoal => Succesfully used intention', async () => {
  
  class DimOnLight extends Intention {
    static applicable (goal) {
        return goal instanceof LightOn
    }
    *exec () {
        for (let i = 0; i < 10; i++) {
            yield new Promise( res => setTimeout(res, 50))
        }
    }
  }
  var lightOn = new LightOn({light: 'light0'})
  var agent = new Agent('a2')
  agent.intentions.push(DimOnLight)
  expect( await agent.postSubGoal(lightOn) ).toBe(true);

});

test('Agent.postSubGoal => No success in achieving goal', async () => {

  var agent = new Agent('a3')
  expect( await agent.postSubGoal(new LightOn()) ).toBe(false);

});

test('Agent.postSubGoal => Trying to use intention => No success in achieving goal', async () => {

  class DimOnLight extends Intention {
    *exec () {
        yield Promise.reject('generic test-plan failure')
    }
  }

  var agent = new Agent('a4')
  agent.intentions.push(DimOnLight)
  expect( await agent.postSubGoal(new LightOn()) ).toBe(false);

});
