const Agent = require('../bdi/Agent')
const PlanningGoal =  require('../planning/PlanningGoal')
const pddlActionIntention =  require('../pddl/actions/pddlActionIntention')



class LightOn extends pddlActionIntention {

    static parameters = ['l'];
    static precondition = [ ['switched-off', 'l'] ];
    static effect = [ ['switched-on', 'l'], ['not switched-off', 'l'] ];
    
    *exec () {
        let args = this.goal.parameters.args
        for (let i = 0; i < 3; i++) {
            this.log(args, i)
            yield new Promise( res => setTimeout(res, 50))
        }
        yield
    }

}



test('Blackbox.blackboxExec()', async () => {

    var a1 = new Agent('a1')

    var BlackboxIntention = require('./Blackbox')([LightOn])
    var i1 = new BlackboxIntention(a1, new PlanningGoal({}))

    await i1.blackboxExec('./src/pddl/domain-lights.test.pddl', './src/pddl/problem-lights.test.pddl')
    expect(i1.plan.length).toBe(1);

});

test('Blackbox.run()', async () => {

    var a1 = new Agent('a2')
    a1.beliefs.declare('switched-off l1')

    var BlackboxIntention = require('./Blackbox')([LightOn])
    var i1 = new BlackboxIntention(a1, new PlanningGoal({goal: ['switched-on l1']}))

    expect( await i1.run() ).toBe(true);

});

test('Blackbox agent', async () => {

    var a1 = new Agent('a3')
    a1.beliefs.declare('switched-off l1')
    
    var BlackboxIntention = blackboxGenerator()
    BlackboxIntention.addAction(LightOn)
    a1.intentions.push(BlackboxIntention)

    expect( await a1.postSubGoal( new PlanningGoal({goal: ['switched-on l1']}) ) ).toBe(true);

});