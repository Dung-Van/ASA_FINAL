const Intention = require('../bdi/Intention')
const Agent = require('../bdi/Agent')
const PlanningGoal = require('../pddl/PlanningGoal')
const pddlActionIntention = require('../pddl/actions/pddlActionIntention')



class FakeAction extends pddlActionIntention {

    *exec () {
        for ( let b of this.effect )
            this.agent.beliefs.apply(b)
        yield new Promise(res=>setTimeout(res,100))
        this.log('effects applied')
        // this.log(this.agent.beliefs)
    }

}

class PickUp extends FakeAction {

    static parameters = ['ob']
    static precondition = [ ['clear', 'ob'], ['on-table', 'ob'], ['empty'] ]
    static effect = [ ['holding', 'ob'], ['not empty'], ['not clear', 'ob'], ['not on-table', 'ob'] ]

}

class PutDown extends FakeAction {

    static parameters = ['ob']
    static precondition = [ ['holding', 'ob'] ]
    static effect = [ ['not holding', 'ob'], ['empty'], ['clear', 'ob'], ['on-table', 'ob'] ]

}

class Stack extends FakeAction {

    static parameters = ['x', 'y']
    static precondition = [ ['holding', 'x'], ['clear', 'y'] ]
    static effect = [ ['holding', 'x'], ['empty'], ['clear', 'x'], ['not clear', 'y'], ['on', 'x', 'y'] ]

}

class UnStack extends FakeAction {

    static parameters = ['x', 'y']
    static precondition = [ ['on', 'x', 'y'], ['clear', 'x'], ['empty'] ]
    static effect = [ ['holding', 'x'], ['not empty'], ['not clear', 'x'], ['clear', 'y'], ['not on', 'x', 'y'] ]

}

// var blocksworldDomain = new PddlDomain('blocksworld')
// blocksworldDomain.addPredicate(['clear', 'x'])
// blocksworldDomain.addPredicate(['on-table', 'x'])
// blocksworldDomain.addPredicate(['holding', 'x'])
// blocksworldDomain.addPredicate(['on', 'x' ,'y'])
// blocksworldDomain.addPredicate(['empty'])
// blocksworldDomain.addAction(PickUp)
// blocksworldDomain.addAction(PutDown)
// blocksworldDomain.addAction(Stack)
// blocksworldDomain.addAction(UnStack)
// blocksworldDomain.saveToFile()



// var blocksworldProblem = new PddlProblem('blocksworld')
// blocksworldProblem.addObject('a', 'b')
// blocksworldProblem.addInit('on-table a', 'on-table b', 'clear a', 'clear b', 'empty')
// blocksworldProblem.addGoal('holding a')
// blocksworldProblem.saveToFile()



var a1 = new Agent('a1')
a1.beliefs.declare('on-table a')
a1.beliefs.declare('on b a')
a1.beliefs.declare('clear b')
a1.beliefs.declare('empty')
let {PlanningIntention} = require('../pddl/Blackbox')([PickUp, PutDown, Stack, UnStack])
a1.intentions.push(PlanningIntention)
console.log('a1 entries', a1.beliefs.entries)
console.log('a1 literals', a1.beliefs.literals)
a1.postSubGoal( new PlanningGoal( { goal: ['holding a'] } ) )



// var blackbox = new Blackbox(new LightOn({l: 'light1'}), './bin/blocks-domain.pddl', './bin/blocks-problem.pddl')
// var blackbox = new Blackbox(a1, new BlocksWorldGoal({ob: 'a'}))
// blackbox.run()
